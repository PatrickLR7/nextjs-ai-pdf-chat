import AWS from "aws-sdk";

export interface S3FileBlob {
  fileName: string;
  blob: Blob;
}

export async function downloadFromS3(
  file_key: string
): Promise<S3FileBlob | null> {
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

    const params = {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: file_key,
    };

    const obj = await s3.getObject(params).promise();
    const file = {
      fileName: file_key,
      blob: new Blob([obj.Body as Buffer]),
    };
    return file;
  } catch (error) {
    console.error(error);
    return null;
  }
}
