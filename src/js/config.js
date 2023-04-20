const config = (() => {
  /* 
    1 开发环境
    2 测试环境
    3 预发布环境
    4 生产环境
  */
  const envFlag = 1;

  switch (envFlag) {
    case 1:
      return {
        baseUrl: "https://api-dev.iamdola.com",
        SK: "ef37604cc805bb1f4513790a227b2b60",
      };
    case 2:
      return {
        baseUrl: "https://api-test.iamdola.com",
        SK: "ef37604cc805bb1f4513790a227b2b60",
      };
    case 3:
      return {
        baseUrl: "https://api-stage.iamdola.com",
        SK: "ef37604cc805bb1f4513790a227b2b60",
      };
    case 4:
      return {
        baseUrl: "https://api.scmingrizhixing.cn",
        SK: "64cf6ca70c39b70dfa1e8577905a7969",
      };
  }
})();

export default config;
