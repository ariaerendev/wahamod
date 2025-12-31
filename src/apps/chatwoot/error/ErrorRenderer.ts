import { ApiError as ChatWootAPIError } from '@figuro/chatwoot-sdk/dist/core/ApiError';
import type { AxiosError } from 'axios';

interface IErrorRender<T> {
  /**
   * Get an error text to show to the user
   */
  text(error: T): string;

  /**
   * Structured error data for logging/inspection
   */
  data(error: T): Record<string, any>;
}

class AxiosErrorRenderer implements IErrorRender<AxiosError> {
  text(error: AxiosError): string {
    let errorText = `API Error: ${error.message}`;
    if (!error.response?.data) {
      return errorText;
    }

    try {
      const data = error.response.data as any;
      let json: any;
      if (Buffer.isBuffer(data)) {
        json = JSON.parse(data.toString());
      } else if (typeof data === 'object') {
        json = data;
      } else {
        json = JSON.parse(data as any);
      }
      errorText += `\nData: ${JSON.stringify(json, null, 2)}`;
    } catch (e) {
      errorText += 'Data: <unparsable>';
    }

    return errorText;
  }

  data(error: AxiosError): Record<string, any> {
    const { config, response, request } = error as any;

    return {
      class: 'APIError',
      request: {
        method: request?.method || config?.method,
        url: request?.path || config?.url,
        params: config?.params,
        body: request?.body || config?.data,
      },
      response: {
        status: response?.status,
        statusText: response?.statusText,
        headers: response?.headers,
        body: response?.data,
      },
      message: error.message,
      code: (error as any)?.code,
      stack: error.stack,
    };
  }
}

class ChatWootAPIErrorRenderer implements IErrorRender<ChatWootAPIError> {
  text(error: ChatWootAPIError): string {
    let errorText = `ChatWoot API Error: ${error.message}`;
    errorText += `\nStatus: ${error.status}`;

    if (error.body) {
      try {
        const body =
          typeof error.body === 'object' ? error.body : JSON.parse(error.body);
        errorText += `\nBody: ${JSON.stringify(body, null, 2)}`;
      } catch (e) {
        errorText += `\nBody: ${error.body}`;
      }
    }

    return errorText;
  }

  data(error: ChatWootAPIError): Record<string, any> {
    return {
      class: 'ChatWootAPIError',
      request: {
        method: error.request?.method,
        url: error.request?.url,
        query: error.request?.query,
        path: error.request?.path,
        body: error.request?.body,
      },
      response: {
        status: error.status,
        statusText: error.statusText,
        body: error.body,
      },
      message: error.message,
      stack: error.stack,
    };
  }
}

class GenericErrorRenderer implements IErrorRender<any> {
  text(error: any): string {
    return error?.toString?.() ?? String(error);
  }

  data(error: any): Record<string, any> {
    return {
      class: error?.name ?? error?.constructor?.name ?? typeof error,
      message: error?.message ?? String(error),
      stack: error.stack,
    };
  }
}

/**
 * Class responsible for rendering error information based on error type
 */
export class ErrorRenderer implements IErrorRender<any> {
  private readonly axiosRenderer = new AxiosErrorRenderer();
  private readonly chatwootRenderer = new ChatWootAPIErrorRenderer();
  private readonly genericRenderer = new GenericErrorRenderer();

  /**
   * Renders error information based on error type
   * @param error The error to render
   * @returns Formatted error text
   */
  public text(error: any): string {
    if (error?.isAxiosError) {
      return this.axiosRenderer.text(error as AxiosError);
    }

    if (error instanceof ChatWootAPIError) {
      return this.chatwootRenderer.text(error);
    }

    return this.genericRenderer.text(error);
  }

  public data(error: any): Record<string, any> {
    if (error?.isAxiosError) {
      return this.axiosRenderer.data(error as AxiosError);
    }

    if (error instanceof ChatWootAPIError) {
      return this.chatwootRenderer.data(error);
    }

    return this.genericRenderer.data(error);
  }
}
