// 登录接口
import api from "@/utils/api.js";

export const studentMemberLogin = (data) => {
    return api({
        url: "/Student-users/login",
        method: "post",
        data: data
    });
};

// 登出接口
export const studentMemberLogout = () => {
    return api({
        url: "/Student-users/logout",
        method: "post"
    });
};

// 更新用户信息（姓名+头像，适配portrait字段）
export const updateMemberInfo = (data) => {
    return api({
        url: "/Student-members/info",
        method: "put",
        data: data
    });
};

// 上传头像
export const uploadAvatar = (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api({
        url: "/Student-members/upload-avatar",
        method: "post",
        data: formData,
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
};

export default {
    studentMemberLogin,
    studentMemberLogout,
    updateMemberInfo,
    uploadAvatar
};