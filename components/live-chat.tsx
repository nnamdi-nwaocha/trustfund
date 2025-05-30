"use client";

import { useEffect } from "react";

export function LiveChat() {
  useEffect(() => {
    // Smartsupp Live Chat script
    window._smartsupp = window._smartsupp || {};
    window._smartsupp.key = "e9cb2fa329510617d9d77d543fcbd37e4121683d";
    if (!window.smartsupp) {
      (function (d) {
        var s,
          c,
          o = function () {
            o._.push(arguments);
          };
        o._ = [];
        window.smartsupp = o;
        s = d.getElementsByTagName("script")[0];
        c = d.createElement("script");
        c.type = "text/javascript";
        c.charset = "utf-8";
        c.async = true;
        c.src = "https://www.smartsuppchat.com/loader.js?";
        s.parentNode.insertBefore(c, s);
      })(document);
    }
    // Cleanup: Optionally remove the script on unmount
    return () => {
      // Optionally, you could remove the script if needed
    };
  }, []);

  return null;
}
