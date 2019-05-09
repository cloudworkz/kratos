const serviceConfig = {
  http: {
    port: 1918,
    // access: "*" is default
    access: {
      "atoken": "*", // any access, also allows to change topic config
    },
  },
};

export {
  serviceConfig,
};
