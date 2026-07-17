import { jsx, jsxs } from 'react/jsx-runtime';
import { forwardRef } from 'react';

const mapTokenToSize = {
  "2xs": "16",
  xs: "20",
  sm: "24",
  md: "32",
  lg: "40",
  xl: "48",
  "3xl": "80"
};
const isToken = (name) => {
  return name in mapTokenToSize;
};
const withIcon = ({
  icon,
  iconName,
  prefix
}, name) => {
  const [width, height, , , vectorData] = icon;
  const Icon = forwardRef(
    ({ size = 20, ...props }, ref) => {
      if (isToken(size)) {
        size = mapTokenToSize[size];
      }
      return /* @__PURE__ */ jsx(
        "svg",
        {
          "data-icon": iconName,
          "data-prefix": prefix,
          height: Math.ceil(parseInt(`${size}`) / 1.25),
          ref,
          viewBox: `0 0 ${width} ${height}`,
          width: size,
          xmlns: "http://www.w3.org/2000/svg",
          ...props,
          children: Array.isArray(vectorData) ? /* @__PURE__ */ jsxs("g", { children: [
            /* @__PURE__ */ jsx("path", { d: vectorData[0], fill: "currentColor" }),
            /* @__PURE__ */ jsx("path", { d: vectorData[1], fill: "currentColor" })
          ] }) : /* @__PURE__ */ jsx("path", { d: vectorData, fill: "currentColor" })
        }
      );
    }
  );
  Icon.displayName = `@optimizely/axiom/${name}`;
  return Icon;
};

export { withIcon };
