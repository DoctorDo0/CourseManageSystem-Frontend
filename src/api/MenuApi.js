const menus = [
    {
        name: "数据统计",
        url: "/main/data"
    }, {
        name: "课程及预约管理",
        children: [{
            name: "学生管理",
            url: "/main/student"
        }, {
            name: "教师管理",
            url: "/main/teacher"
        }, {
            name: "课程管理",
            url: "/main/course"
        }, {
            name: "课程信息管理",
            url: "/main/course-info"
        }, {
            name: "预约管理",
            url: "/main/appointment"
        }]
    }, {
        name: "系统设置",
        icon: "setting",
        url: "/setting"
    }, {
        name: "退出系统",
        url: "/logout"
    }
];


export default menus;