// src/types/react-native-html-to-pdf.d.ts
declare module 'react-native-html-to-pdf' {
    export interface Options {
      html: string;
      fileName?: string;
      directory?: string;
      base64?: boolean;
      height?: number;
      width?: number;
      padding?: number;
    }
  
    export interface Response {
      filePath: string;
      base64?: string;
    }
  
    export default {
      convert(options: Options): Promise<Response>;
    };
  }