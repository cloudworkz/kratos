module.exports = {
  http: {
    port: 1919,
    access: "*",
  },
  gcs: {
    client: {
      projectId: process.env.GOOGLE_PROJECT_ID || "",
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || "",
    },
    bucketName: process.env.GOOGLE_BUCKET || "",
  },
};
