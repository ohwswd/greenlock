function getAccountKeypair(email) {
  var json = localStorage.getItem("account:" + email);
  if (json) {
    return Promise.resolve(JSON.parse(json));
  }

  return Keypairs.generate(ECDSA_OPTS)
    .catch(function (err) {
      console.warn(
        "[Error] Keypairs.generate(" + JSON.stringify(ECDSA_OPTS) + "):\n",
        err
      );
      return Keypairs.generate(RSA_OPTS).catch(function (err) {
        console.error(
          "[Error] Keypairs.generate(" + JSON.stringify(RSA_OPTS) + "):"
        );
        throw err;
      });
    })
    .then(function (pair) {
      localStorage.setItem("account:" + email, JSON.stringify(pair.private));
      return pair.private;
    });
}
function newAlert(str) {
  return new Promise(function () {
    setTimeout(function () {
      window.alert(str);
      if (window.confirm("Start over?")) {
        document.location.href = document.location.origin;
      }
    }, 10);
  });
}
let BROWSER_SUPPORTS_RSA = false;
let ECDSA_OPTS = { kty: "EC", namedCurve: "P-256" };
let RSA_OPTS = { kty: "RSA", modulusLength: 2048 };
let PromiseA = window.Promise;

export function getVaildInfo(domain, email, callback) {
  let info = { agree: true };

  let acme;
  let apiUrl = "https://acme-v02.api.letsencrypt.org/directory";
  function testKeypairSupport() {
    return Keypairs.generate(RSA_OPTS)
      .then(function () {
        console.info("[crypto] RSA is supported");
        BROWSER_SUPPORTS_RSA = true;
      })
      .catch(function () {
        console.warn("[crypto] RSA is NOT supported");
        return Keypairs.generate(ECDSA_OPTS)
          .then(function () {
            console.info("[crypto] ECDSA is supported");
          })
          .catch(function (e) {
            console.warn("[crypto] EC is NOT supported");
            throw e;
          });
      });
  }

  info.cryptoCheck = testKeypairSupport()
    .then(function () {
      console.info("[crypto] self-check: passed");
    })
    .catch(function (err) {
      console.error("[crypto] could not use either RSA nor EC.");
      console.error(err);
      window.alert(
        "Generating secure certificates requires a browser with cryptography support." +
          "Please consider a recent version of Chrome, Firefox, or Safari."
      );
      throw err;
    });

  info.domains = domain
    .replace(/https?:\/\//g, " ")
    .replace(/[,+]/g, " ")
    .trim()
    .split(/\s+/g);
  info.identifiers = info.domains.map(function (hostname) {
    return { type: "dns", value: hostname.toLowerCase().trim() };
  });
  info.identifiers.sort(function (a, b) {
    if (a === b) {
      return 0;
    }
    if (a < b) {
      return 1;
    }
    if (a > b) {
      return -1;
    }
  });
  acme = ACME.create({ Keypairs: Keypairs, CSR: CSR });
  acme.init(apiUrl).then(function () {
    step1();
  });
  info.email = email.toLowerCase().trim();
  info.contact = ["mailto:" + info.email];
  function step1() {
    info.cryptoCheck
      .then(function () {
        return getAccountKeypair(email).then(function (jwk) {
          // TODO save account id rather than always retrieving it?
          console.info("[accounts] upsert for", email);
          return acme.accounts
            .create({
              email: email,
              agreeToTerms: info.agree && true,
              accountKeypair: { privateKeyJwk: jwk },
            })
            .then(function (account) {
              console.info("[accounts] result:", account);
              info.account = account;
              info.privateJwk = jwk;
              info.email = email;
            })
            .catch(function (err) {
              console.error("[accounts] failed to upsert account:");
              console.error(err);
              return newAlert(err.message || JSON.stringify(err, null, 2));
            });
        });
      })
      .then(function () {
        var jwk = info.privateJwk;
        var account = info.account;

        console.info("[orders] requesting");
        return acme.orders
          .request({
            account: account,
            accountKeypair: { privateKeyJwk: jwk },
            domains: info.domains,
          })
          .then(function (order) {
            info.order = order;
            console.info("[orders] created ", order);

            var claims = order.claims;

            var obj = { "dns-01": [], "http-01": [], wildcard: [] };
            info.challenges = obj;

            claims.forEach(function (claim) {
              //#console.log("claims[i]", claim);
              var hostname = claim.identifier.value;
              claim.challenges.forEach(function (c) {
                var auth = c;
                var data = {
                  type: c.type,
                  hostname: hostname,
                  url: c.url,
                  token: c.token,
                  httpPath: auth.challengeUrl,
                  httpAuth: auth.keyAuthorization,
                  dnsType: "TXT",
                  dnsHost: auth.dnsHost,
                  dnsAnswer: auth.keyAuthorizationDigest,
                };
                //#console.log("claims[i].challenge", data);

                if (claim.wildcard) {
                  obj.wildcard.push(data);
                } else if (obj[data.type]) {
                  obj[data.type].push(data);
                }
              });
            });

            callback(info, acme);
            console.info("[housekeeping] challenges", info.challenges);
          })
          .catch(function (err) {
            if (err.detail || err.urn) {
              console.error("(Probably) User Error:");
              console.error(err);
              return newAlert(
                "There was an error, probably with your email or domain:\n" +
                  err.message
              );
            }
            throw err;
          });
      })
      .catch(function (err) {
        console.error("Step '' Error:");
        console.error(err, err.stack);
        return newAlert(
          "An error happened (but it's not your fault)." +
            " Email aj@rootprojects.org to let him know that 'order and get challenges' failed."
        );
      });
  }
}
export function getkeyPem(acme, info, challengePriority, callback) {
  function getServerKeypair() {
    var sortedAltnames = info.identifiers
      .map(function (ident) {
        return ident.value;
      })
      .sort()
      .join(",");
    var serverJwk = JSON.parse(
      localStorage.getItem("server:" + sortedAltnames) || "null"
    );
    if (serverJwk) {
      return PromiseA.resolve(serverJwk);
    }

    var keypairOpts;
    // TODO allow for user preference
    if (BROWSER_SUPPORTS_RSA) {
      keypairOpts = RSA_OPTS;
    } else {
      keypairOpts = ECDSA_OPTS;
    }

    return Keypairs.generate(RSA_OPTS)
      .catch(function (err) {
        console.error(
          "[Error] Keypairs.generate(" + JSON.stringify(RSA_OPTS) + "):"
        );
        throw err;
      })
      .then(function (pair) {
        localStorage.setItem(
          "server:" + sortedAltnames,
          JSON.stringify(pair.private)
        );
        return pair.private;
      });
  }

  getAccountKeypair(info.email).then(function (jwk) {
    // TODO put a test challenge in the list
    // info.order.claims.push(...)
    // TODO warn about wait-time if DNS
    return getServerKeypair().then(function (serverJwk) {
      return acme.orders
        .complete({
          account: info.account,
          accountKeypair: { privateKeyJwk: jwk },
          order: info.order,
          domains: info.domains,
          domainKeypair: { privateKeyJwk: serverJwk },
          challengePriority: challengePriority,
          challenges: false,
        })
        .then(function (certs) {
          return Keypairs.export({ jwk: serverJwk }).then(function (keyPem) {
            console.info("WINNING!");
            console.info(certs);
            var fullChainText = [
              certs.cert.trim() + "\n",
              certs.chain + "\n",
            ].join("\n");
            callback(fullChainText, keyPem);
          });
        });
    });
  });
}
