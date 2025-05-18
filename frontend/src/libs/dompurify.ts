export default {
  sanitize(html: string): string {
    return html.replace(/<script.*?>.*?<\/script>/gis, '');
  }
};
