import fetchRetry from "fetch-retry";

interface MakeSolidFetchOptions {
  /**
   * return false if the response should be retried
   */
  verifyResponse: (response: unknown) => Promise<boolean>;
}

// @note: returns already parsed response
type SolidFetch = (input: string, init?: RequestInit) => Promise<unknown>;

export function makeSolidFetch(opts: MakeSolidFetchOptions): SolidFetch {
  const solidFetch = fetchRetry(self.fetch, {
    retries: 3,
    async retryOn(_attempt, error, response) {
      const retry = error !== null || !response?.ok;
      if (retry) {
        // eslint-disable-next-line no-console
        console.log("Retrying failed fetch", {
          error,
          status: response?.status,
        });
      }
      // if we have a response, we verify it and decide if we should retry
      if (!retry) {
        const responseJson = await response.clone().json();
        const verified = await opts.verifyResponse(responseJson);
        if (!verified) {
          console.log("Response verification failed, retrying...");
        }

        return !verified;
      }

      return true;
    },
    retryDelay: function (attempt) {
      return Math.pow(2, attempt) * 1000;
    },
  });

  return (input: string, init?: RequestInit) =>
    solidFetch(input, init).then((response) => response.json());
}
