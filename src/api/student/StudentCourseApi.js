import api from "@/utils/api.js";

export const findAvailableStudentCourses = (page = 1, limit = 10) => {
    const studentId = localStorage.getItem("studentId");
    return api({
        url: "/course-info/Student-lessons/available",
        method: "get",
        params: {
            pageNo: page,
            pageSize: limit,
            studentId
        }
    });
};