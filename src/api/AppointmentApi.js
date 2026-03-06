import api from "@/utils/api.js";

function findAll(pageNo, pageSize, params) {
    return api({
        url: "/appointment",
        method: "get",
        params: {
            page: pageNo,
            limit: pageSize,
            ...params
        }
    });
}

function deleteByIds(ids) {
    return api({
        url: "/appointment",
        method: "delete",
        data: ids
    })
}

function save(appointment) {
    return api({
        url: "/appointment",
        method: "post",
        data: appointment
    });
}

function update(appointment) {
    return api({
        url: "/appointment",
        method: "put",
        data: appointment
    });
}

function getStudentMainInfo() {
    return api({
        url: "/student/mainInfo",
        method: "get"
    });
}

function getCourseInfoMainInfo() {
    return api({
        url: "/course-info/mainInfo",
        method: "get"
    });
}

function bookAppointmentWithParam(appointment) {
    return api({
        url: "/appointment/book",
        method: "post",
        data: appointment
    })
}

function cancelAppointmentByIds(ids) {
    return api({
        url: "/appointment/cancel",
        method: "put",
        data: ids
    });
}

function setAttendStatusByIds(ids) {
    return api({
        url: "/appointment/attend",
        method: "put",
        data: ids
    });
}

function setAbsentStatusByIds(ids) {
    return api({
        url: "/appointment/absent",
        method: "put",
        data: ids
    });
}

function setLateStatusByIds(ids) {
    return api({
        url: "/appointment/late",
        method: "put",
        data: ids
    });
}

function setLeaveStatusByIds(ids) {
    return api({
        url: "/appointment/leave",
        method: "put",
        data: ids
    });
}

export {
    findAll,
    deleteByIds,
    save,
    update,
    getStudentMainInfo,
    getCourseInfoMainInfo,
    bookAppointmentWithParam,
    cancelAppointmentByIds,
    setAttendStatusByIds,
    setAbsentStatusByIds,
    setLateStatusByIds,
    setLeaveStatusByIds
}