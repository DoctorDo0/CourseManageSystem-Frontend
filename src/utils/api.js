import axios from "axios";
import {getJwt, removeJwt, setJwt} from "@/api/JwtApi.js";

const api = axios.create({
    baseURL: "/api",
    timeout: 3000
});

//响应拦截器
api.interceptors.response.use(
    resp => {
        let jwt = resp.headers["x-auth-token"];
        if (jwt) {
            setJwt(jwt);
        }
        return resp.data;
    },
    error => {
        if (error.response.status === 401) {
            removeJwt();
            // location.href = "/login";
            const isPeoplePage = location.pathname.startsWith("/Student");
            location.href = isPeoplePage ? "/Student-login" : "/login";
            return false;
        }
        return {
            code: error.response.status || 500,
            success: false,
            msg: error || "api接口调用失败"
        };
    }
);

//定义请求拦截器
api.interceptors.request.use(config => {
    config.headers["Authorization"] = getJwt();
    return config;
});

export default api;
