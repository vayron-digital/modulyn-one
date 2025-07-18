declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.svg?url' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
} 