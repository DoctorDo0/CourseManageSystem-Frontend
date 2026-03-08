import {createRouter, createWebHistory} from "vue-router";
import {getJwt, removeJwt} from "@/api/JwtApi.js";

//路由
const routes = [
    {
        name: "main",
        path: "/main",
        component: () => import("@/components/views/Main.vue"),
        children: [
            {
                name: "main-data",
                path: "/main/data",
                component: () => import("@/components/views/data/Data.vue")
            }, {
                name: "main-student",
                path: "/main/student",
                component: () => import("@/components/views/student/Student.vue")
            }, {
                name: "main-teacher",
                path: "/main/teacher",
                component: () => import("@/components/views/teacher/Teacher.vue")
            }, {
                name: "main-course",
                path: "/main/course",
                component: () => import("@/components/views/course/Course.vue")
            }, {
                name: "main-course-info",
                path: "/main/course-info",
                component: () => import("@/components/views/course-info/Course-info.vue")
            }, {
                name: "main-appointment",
                path: "/main/appointment",
                component: () => import("@/components/views/appointment/Appointment.vue")
            }
        ]
    }, {
        name: "index",
        path: "",
        redirect: "/main"
    }, {
        name: "login",
        path: "/login",
        component: () => import("@/components/views/Login.vue")
    },

    //单独页面部分
    //==========
    {
        name: "student",
        path: "/student",
        component: () => import("@/components/views/student/Student.vue")
    }, {
        name: "teacher",
        path: "/teacher",
        component: () => import("@/components/views/teacher/Teacher.vue")
    }, {
        name: "course",
        path: "/course",
        component: () => import("@/components/views/course/Course.vue")
    }, {
        name: "course-info",
        path: "/course-info",
        component: () => import("@/components/views/course-info/Course-info.vue")
    }, {
        name: "appointment",
        path: "/appointment",
        component: () => import("@/components/views/appointment/Appointment.vue")
    },
    //==========
    {
        name: "data",
        path: "/data",
        component: () => import("@/components/views/data/Data.vue")
    }, {
        name: "setting",
        path: "/setting",
        component: () => import("@/components/views/Setting.vue")
    }, {
        name: "logout",
        path: "/logout"
    }
];

//创建路由转发器
const router = createRouter({
    routes,
    history: createWebHistory()
});

//路由守卫
router.beforeEach((to, from, next) => {
    if (to.name === "logout") {
        removeJwt();
        next("/login");
        return;
    }

    let jwt = getJwt();

    if (jwt) {
        if (to.name === "login") {
            next("/main");
        } else {
            next();
        }
    } else {
        if (to.name === "login") {
            next();
        } else {
            next("/login");
        }
    }
});

//导出路由转发器
export default router;