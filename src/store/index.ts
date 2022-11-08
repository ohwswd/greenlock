import { defineStore } from "pinia";
export interface ChallengeType {
  keyAuthorization: string;
  token: string;
  type: string;
  httpPath: string;
  httpAuth: string;
  dnsHost: string;
  dnsAnswer: string;
}
export const useInfo = defineStore("useInfo", {
  state: () => {
    return {
      acme: {},
      info: {
        challenges: {
          "http-01": [],
          "dns-01": [],
          wildcard: [],
        },
      },
      keyPem: "",
      fullChainText: "",
    };
  },
});
