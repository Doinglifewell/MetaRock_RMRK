import { ApiPromise, WsProvider } from "@polkadot/api";
import { EventEmitter } from "events";
import { ApiExtension, getApiOptions } from "./utils";
import darwiniaApiOptions from "@darwinia/api-options";

interface ApiService {
  connect(
    apiUrl: string,
    overrideOptions?: string
  ): Promise<ApiPromise | Error>;
  disconnect(): void;
  // registerCustomTypes(userTypes: string, apiUrl?: string): Promise<ApiPromise | Error>;
}

/**
 * Singleton instance for @polkadot/api.
 */
export default class Api extends EventEmitter implements ApiService {
  private static _instance: Api = new Api();
  private _api: ApiPromise | Error;
  private _apiUrl: string;

  /**
   * getInstance
   * @returns Api Instance
   */
  public static getInstance(): Api {
    return Api._instance;
  }

  private constructor() {
    super();
  }

  /**
   * connect
   * @requires apiUrl: string
   * @returns instance of polkadot-js/api instance
   */
  public async connect(
    apiUrl: string,
    overrideOptions?: string
  ): Promise<ApiPromise | Error> {
    if (!apiUrl || typeof apiUrl != "string") {
      throw new TypeError(
        `[VUE API] ERR: Unable to init api with apiUrl ${apiUrl}`
      );
    }

    try {
      const provider = new WsProvider(apiUrl);
      console.log("Connect", apiUrl);
      const options = getApiOptions(apiUrl);
      if (overrideOptions == "kusama") {
        const apiPromise = await ApiPromise.create(
          Object.assign({ provider }, options)
        );
        this.setApi(apiPromise);
        this._emit("connect", apiPromise);
      } else if (overrideOptions == "darwinia") {
        const apiPromise = await ApiPromise.create(
          darwiniaApiOptions({ provider: provider })
        );
        this.setApi(apiPromise);
        this._emit("connect", apiPromise);
      }
    } catch (err) {
      this._emit("error", err);
      throw err;
    }

    this.setUrl(apiUrl);
    return this._api;
  }

  /**
   * disconnect
   */
  public disconnect(): void {
    if (this._api) {
      // this._api.once('disconnected', () => this._emit('disconnect', this._apiUrl));
      this._api.disconnect();
      this.setUrl(null);
    }
  }

  private setApi(api: ApiPromise) {
    this._api = api;
  }

  private setUrl(apiUrl: string) {
    this._apiUrl = apiUrl;
  }

  get api() {
    return this._api;
  }

  /**
   * tryEmit
   *
   */
  public _emit(message: string = "event", payload?: any) {
    this.emit(message, payload);
  }
}
