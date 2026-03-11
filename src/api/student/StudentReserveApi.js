// 预约课程
import api from "@/utils/api.js";

export const studentReserveCourse = (courseInfoId) => {
    const studentId = localStorage.getItem("studentId");
    return api({
        // url: `/student-book-records/${lessonId}`,
        url: "/appointment/Student/book",
        method: "post",
        data: {
            studentId: studentId,
            courseInfoId: courseInfoId
        }
    });
};

// 取消预约
export const studentCancelReserve = (appointmentId) => {
    return api({
        url: "/appointment/Student/cancel",
        method: "post",
        data: appointmentId,  // 直接发送数字，不包在对象里
        headers: {
            'Content-Type': 'application/json'  // 明确指定JSON格式
        }
    });
};

// 查询我的课程
export const findMyStudentCourses = (page = 1, limit = 10) => {
    const studentId = localStorage.getItem("studentId");
    return api({
        url: "/appointment/Student/book-records",
        method: "get",
        params: {
            pageNo: page,
            pageSize: limit,
            studentId
        }
    });
};