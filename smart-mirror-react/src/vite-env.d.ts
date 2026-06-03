/// <reference types="vite/client" />

// The "with-locales" build has no bundled types; it's the same moment API.
declare module "moment/min/moment-with-locales" {
  import moment from "moment";
  export default moment;
}
