const serviceConfig = {
  http: {
    port: 1918,
    // access: "*" is default
    access: {
      atoken: "*", // any access, also allows to change topic config
    },
  },
  gcs: {
    client: {
      projectId: process.env.GOOGLE_PROJECT_ID || "",
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || "",
    },
    bucketName: process.env.GOOGLE_BUCKET || "",
  },
};

export {
  serviceConfig,
};
