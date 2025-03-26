const base = {
    get() {
        return {
            url : "http://localhost:8080/wurenchaosguanli/",
            name: "wurenchaosguanli",
            // 退出到首页链接
            indexUrl: 'http://localhost:8080/wurenchaosguanli/front/index.html'
        };
    },
    getProjectName(){
        return {
            projectName: "无人超市管理系统"
        } 
    }
}
export default base
