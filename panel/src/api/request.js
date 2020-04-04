import api from "./api.js";
import store from "@/store/store.js";

export default {
  running: 0,
  async request(path, options, silent = false) {
    // create options object
    options = Object.assign(options || {}, {
      credentials: "same-origin",
      cache: "no-store",
      headers: {
        "x-requested-with": "xmlhttprequest",
        "content-type": "application/json",
        ...options.headers,
      }
    });

    // adapt headers for all non-GET and nob-POST methods
    if (options.method !== 'GET' && options.method !== 'POST') {
      options.headers["x-http-method-override"] = options.method;
      options.method = 'POST';
    }

    // if language set, add to headers
    if (store.state.languages.current) {
      options.headers["x-language"] = store.state.languages.current.code;
    }

    // add the csrf token to every request
    options.headers["x-csrf"] = window.panel.csrf;

    // create a request id
    const id = path + "/" + JSON.stringify(options);

    api.config.onStart(id, silent);
    this.running++;

    // fetch the resquest's response
    let response = await fetch(api.config.endpoint + "/" + path, options);
    let text     = await response.text();

    // try to parse JSON
    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      throw new Error("The JSON response from the API could not be parsed. Please check your API connection.");
    }

    try {
      if (json.status && json.status === "error") {
        throw json;
      }

      let response = json;

      if (json.data && json.type && json.type === "model") {
        response = json.data;
      }

      this.running--;
      api.config.onComplete(id);
      api.config.onSuccess(json);
      return response;

    } catch (e) {
      this.running--;
      api.config.onComplete(id);
      api.config.onError(e);
      throw e;
    }
  },
  async get(path, query, options, silent = false) {
    if (query) {
      path +=
        "?" +
        Object.keys(query)
          .map(key => {
            const value = query[key];

            if (value !== undefined && value !== null) {
              return key + "=" + value;
            } else {
              return null;
            }

          })
          .filter(value => value !== null)
          .join("&");
    }

    return this.request(
      path,
      Object.assign(
        options || {},
        {
          method: "GET"
        }
      ),
      silent
    );
  },
  async post(path, data, options, method = "POST", silent = false) {
    return this.request(
      path,
      Object.assign(
        options || {},
        {
          method: method,
          body: JSON.stringify(data)
        }
      ),
      silent
    );
  },
  async patch(path, data, options, silent = false) {
    return this.post(path, data, options, "PATCH", silent);
  },
  async delete(path, data, options, silent = false) {
    return this.post(path, data, options, "DELETE", silent);
  }
};
