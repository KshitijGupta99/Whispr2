/**
 * Reserved for direct uploads to object storage from the client.
 */
export async function uploadBytes(_file: Blob, _key: string): Promise<string> {
  throw new Error("Client uploads are handled via presigned URLs from the backend.");
}
