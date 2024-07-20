import { getClientApi } from "@/app/utils";
import { ClientApi, getHeaders } from "../api";
import { ChatSession } from "@/app/store";

export interface FileInfo {
  originalFilename: string;
  fileName: string;
  filePath: string;
  size: number;
  partial?: string;
}

export class FileApi {
  async upload(file: any): Promise<FileInfo> {
    const fileName = file.name;
    const fileSize = file.size;
    const formData = new FormData();
    formData.append("file", file);
    var headers = getHeaders(true);
    const api = "/api/file/upload";
    var res = await fetch(api, {
      method: "POST",
      body: formData,
      headers: {
        ...headers,
      },
    });
    const resJson = await res.json();
    console.log(resJson);
    return {
      originalFilename: fileName,
      size: fileSize,
      fileName: resJson.fileName,
      filePath: resJson.filePath,
    };
  }

  async uploadForRag(file: any, session: ChatSession): Promise<FileInfo> {
    var fileInfo = await this.upload(file);
    var api: ClientApi = getClientApi(session.mask.modelConfig.model);
    let partial = await api.llm.createRAGStore({
      chatSessionId: session.id,
      fileInfos: [fileInfo],
    });
    fileInfo.partial = partial;
    return fileInfo;
  }
}
