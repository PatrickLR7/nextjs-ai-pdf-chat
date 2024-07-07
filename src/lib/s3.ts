import AWS from "aws-sdk";

export async function uploadToS3(file: File) {
  try {
    AWS.config.update({
      credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY ?? "",
      },
    });

    const s3 = new AWS.S3({
      params: {
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
      },
      region: "us-east-1",
    });

    const file_key = `uploads/${Date.now().toString()}${file.name.replace(
      " ",
      "-"
    )}`;

    const params: AWS.S3.PutObjectRequest = {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: file_key,
      Body: file,
      ContentType: "application/pdf",
    };

    const upload = await s3
      .putObject(params)
      .on("httpUploadProgress", (evt) => {
        console.log(
          "Uploading to s3...",
          ((evt.loaded * 100) / evt.total).toFixed(0),
          "%"
        );
      })
      .promise();

    console.log("Sucessfully uploaded to S3!");

    return {
      file_key,
      file_name: file.name,
    };
  } catch (e) {
    console.error(e);
  }
}

export function getS3Url(file_key: string) {
  return `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.amazonaws.com/${file_key}`;
}
