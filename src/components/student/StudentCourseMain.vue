<template>
  <div class="student-course-main-container">
    <!-- 顶部导航 -->
    <div class="header">
      <el-button
          type="text"
          icon="el-icon-setting"
          class="setting-btn"
          @click="openSettingDialog"
      >
        设置
      </el-button>
      <span class="user-name">欢迎，{{ studentName }}</span>
    </div>

    <!-- 底部Tab菜单 -->
    <div class="tab-menu">
      <div
          class="tab-item"
          :class="{ active: activeTab === 'available' }"
          @click="switchTab('available')"
      >
        <i class="el-icon-menu"></i>
        <span>可预约课程</span>
      </div>
      <div
          class="tab-item"
          :class="{ active: activeTab === 'my' }"
          @click="switchTab('my')"
      >
        <i class="el-icon-user"></i>
        <span>我的课程</span>
      </div>
      <div
          class="tab-item"
          :class="{ active: activeTab === 'account' }"
          @click="switchTab('account')"
      >
        <i class="el-icon-setting"></i>
        <span>我的账户</span>
      </div>
    </div>

    <!-- 可预约课程区域 -->
    <div class="content" v-if="activeTab === 'available'">
      <div v-loading="loading" element-loading-text="加载中..." class="course-list">
        <div v-if="availableLessons.length === 0 && !loading" class="empty">
          暂无可预约的课程
        </div>
        <div class="lesson-item" v-for="course_info in availableLessons" :key="course_info.id">
          <div class="lesson-info">
            <h3>{{ course_info.course.courseName }}</h3>
            <p>课程日期：{{ formatTime(course_info.courseDate) }}</p>
            <p>课时：{{ course_info.coursePeriod }}</p>
            <p>课程地点：{{ course_info.courseAddress || '未设置' }}</p>
            <p>教师：{{ course_info.teacher.name || '未设置' }}</p>
            <p>学分：{{ course_info.course.credits || '未设置' }}</p>
            <p>预约人数：{{ course_info.currentNumberInfo || '未设置' }}</p>
          </div>
          <el-button
              type="primary"
              size="small"
              @click="handleBook(course_info.id)"
              :loading="bookLoading === course_info.id"
          >
            立即预约
          </el-button>
        </div>
      </div>
    </div>

    <!-- 我的课程区域 -->
    <div class="content" v-if="activeTab === 'my'">
      <div v-loading="loading" element-loading-text="加载中..." class="course-list">
        <div v-if="myLessons.length === 0 && !loading" class="empty">
          暂无已预约的课程
        </div>
        <div class="lesson-item" v-for="appointment in myLessons" :key="appointment.id" v-if="!loading">
          <div class="lesson-info">
            <h3>{{ appointment.courseInfo.course.courseName }}</h3>
            <p>课程时间：{{ formatTime(appointment.courseInfo.courseDate) }}</p>
            <p>课时：{{ appointment.courseInfo.coursePeriod }}</p>
            <p>课程地点：{{ appointment.courseInfo.courseAddress || '未设置' }}</p>
            <p>教师：{{ appointment.courseInfo.teacher.name || '未设置' }}</p>
            <p>学分：{{ appointment.courseInfo.course.credits || '未设置' }}</p>
            <p>预约人数：{{ appointment.courseInfo.currentNumberInfo || '未设置' }}</p>
            <p class="status-label">签到状态：{{ appointment.recordInfo || '未知' }}</p>
            <p>所得分数：{{ appointment.score || '未设置' }}</p>
            <p>所得学分：{{ appointment.credit || '未设置' }}</p>
          </div>

          <template v-if="appointment.statusText === undefined || appointment.statusText === '已预约'">
            <el-button
                type="danger"
                size="small"
                @click="handleCancel(appointment.id)"
                :loading="cancelLoading === appointment.id"
            >
              取消预约
            </el-button>
          </template>
          <template v-else>
            <span class="status-tag" :class="appointment.statusText">
<!--              {{ appointment.statusText || '未知状态' }}-->
              已预约
            </span>
          </template>
        </div>
      </div>
    </div>

    <!-- 我的账户区域 -->
    <div class="content account-content" v-if="activeTab === 'account'">
      <div class="account-info">
        <!-- 头像显示：使用X字符作为兜底，增加错误处理 -->
        <div class="avatar-wrapper">
          <!-- 有头像时显示图片，无头像/加载失败时显示X字符 -->
          <img
              v-if="studentPortrait"
              :src="studentPortrait"
              class="avatar"
              alt="用户头像"
              @error="handleAvatarError"
          />
          <div v-else class="avatar-placeholder">X</div>
        </div>
        <p><span>用户ID：</span>{{ studentId }}</p>
        <p><span>用户名：</span>{{ studentName }}</p>
      </div>
      <el-button
          type="danger"
          class="logout-btn"
          @click="handleLogout"
          :loading="logoutLoading"
      >
        <i class="el-icon-switch-button"></i>
        安全登出
      </el-button>
    </div>

    <!-- 设置弹窗：修复头像初始化 + X字符兜底 -->
    <el-dialog
        title="账户设置"
        v-model="showSettingDialog"
        width="400px"
        destroy-on-close
    >
      <el-form :model="settingForm" label-width="80px">
        <el-form-item label="头像">
          <el-upload
              class="avatar-uploader"
              action="/api/v1/student-members/upload-avatar"
              :show-file-list="false"
              :http-request="customUploadAvatar"
              :before-upload="beforeAvatarUpload"
          >
            <!-- 弹窗头像：优先临时上传的头像，其次用户头像，最后X字符 -->
            <img
                v-if="settingForm.portrait || studentPortrait"
                :src="settingForm.portrait || studentPortrait"
                class="avatar"
                alt="头像"
                @error="handleUploadAvatarError"
            />
            <div v-else class="avatar-placeholder">X</div>
          </el-upload>
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="settingForm.name" placeholder="请输入新姓名" maxlength="20"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showSettingDialog = false">取消</el-button>
          <el-button type="primary" @click="handleConfirmSetting" :loading="settingLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {ref, onMounted} from "vue";
import {useRouter} from "vue-router";
import {ElMessage, ElMessageBox} from "element-plus";
import {findAvailableStudentCourses} from "@/api/student/StudentCourseApi.js";
import {studentReserveCourse, studentCancelReserve, findMyStudentCourses} from "@/api/student/StudentReserveApi.js";
import {studentMemberLogout, updateMemberInfo} from "@/api/student/StudentMemberApi.js";
import {removeJwt} from "@/api/JwtApi.js";

const router = useRouter();

// 状态管理
const activeTab = ref("available");
const loading = ref(false);
const bookLoading = ref(""); // 预约按钮loading
const cancelLoading = ref(""); // 取消预约按钮loading
const logoutLoading = ref(false); // 登出按钮loading
const availableLessons = ref([]); // 可预约课程列表
const myLessons = ref([]); // 我的课程列表

// 用户信息（从本地存储读取）
const studentId = ref(localStorage.getItem("studentId") || "");
const studentName = ref(localStorage.getItem("studentName") || "用户");
const studentPortrait = ref(localStorage.getItem("studentPortrait") || "");

// 弹窗相关状态
const showSettingDialog = ref(false);
const settingLoading = ref(false);
const settingForm = ref({
  portrait: "", // 临时存储上传的头像URL
  name: ""      // 临时存储修改的姓名
});

// 打开设置弹窗：初始化表单数据
const openSettingDialog = () => {
  // 初始化弹窗表单（同步当前用户信息）
  settingForm.value = {
    portrait: studentPortrait.value,
    name: studentName.value
  };
  showSettingDialog.value = true;
};

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return "";
  const date = new Date(timeStr);
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

// 切换Tab
const switchTab = (tab) => {
  activeTab.value = tab;
  if (tab === "available") {
    loadAvailableLessons();
  } else if (tab === "my") {
    loadMyLessons();
  }
};

// 加载可预约课程
const loadAvailableLessons = async () => {
  loading.value = true;
  try {
    const res = await findAvailableStudentCourses(1, 20);
    if (res.success) {
      availableLessons.value = res.data || [];
    } else {
      ElMessage.error(res.message || "加载失败");
    }
  } catch (error) {
    ElMessage.error("网络异常，加载可预约课程失败");
    console.error("接口异常：", error);
  } finally {
    loading.value = false;
  }
};

// 加载我的课程
const loadMyLessons = async () => {
  loading.value = true;
  try {
    const res = await findMyStudentCourses(1, 20);
    if (res.success) {
      myLessons.value = res.data || [];
    } else {
      ElMessage.error(res.message || "加载失败");
    }
  } catch (error) {
    ElMessage.error("网络异常，加载我的课程失败");
    console.error("接口异常：", error);
  } finally {
    loading.value = false;
  }
};

// 预约课程
const handleBook = async (courseInfoId) => {
  try {
    await ElMessageBox.confirm(
        "确认预约该课程吗？",
        "预约确认",
        {
          confirmButtonText: "确认",
          cancelButtonText: "取消",
          type: "warning"
        }
    );
    bookLoading.value = courseInfoId;

    const res = await studentReserveCourse(courseInfoId);
    if (res.success) {
      ElMessage.success("预约成功");
      loadAvailableLessons();
      loadMyLessons();
    } else {
      ElMessage.error(res.message || "预约失败");
    }
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("预约异常，请重试");
      console.error("预约课程异常：", error);
    }
  } finally {
    bookLoading.value = "";
  }
};

// 取消预约
const handleCancel = async (appointmentId) => {
  try {
    await ElMessageBox.confirm(
        "确认取消该课程预约吗？",
        "取消预约",
        {
          confirmButtonText: "确认",
          cancelButtonText: "取消",
          type: "warning"
        }
    );
    cancelLoading.value = appointmentId;
    const res = await studentCancelReserve(appointmentId);
    if (res.success) {
      ElMessage.success("取消预约成功");
      loadAvailableLessons();
      loadMyLessons();
    } else {
      ElMessage.error(res.message || "取消预约失败");
    }
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("取消预约异常，请重试");
      console.error("取消预约异常：", error);
    }
  } finally {
    cancelLoading.value = "";
  }
};

// 登出
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm(
        "确认退出登录吗？",
        "登出确认",
        {
          confirmButtonText: "确认",
          cancelButtonText: "取消",
          type: "info"
        }
    );
    logoutLoading.value = true;
    await studentMemberLogout();
    removeJwt();
    localStorage.removeItem("studentId");
    localStorage.removeItem("studentName");
    localStorage.removeItem("studentPortrait");
    ElMessage.success("已安全登出");
    router.push("/student-login");
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("登出异常，请重试");
      console.error("登出异常：", error);
    }
  } finally {
    logoutLoading.value = false;
  }
};

// 头像加载失败处理（切换为X字符）
const handleAvatarError = () => {
  studentPortrait.value = ""; // 清空失效的头像URL，触发X字符显示
};

// 弹窗头像加载失败处理
const handleUploadAvatarError = () => {
  settingForm.value.portrait = ""; // 清空失效的临时头像URL
};

// 头像上传前校验
const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith("image/");
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isImage) {
    ElMessage.error("只能上传图片格式文件！");
    return false;
  }
  if (!isLt2M) {
    ElMessage.error("图片大小不能超过 2MB！");
    return false;
  }
  return true;
};

// 新增：自定义头像上传方法
import {uploadAvatar} from "@/api/student/StudentMemberApi.js";
import {formatDate} from "@vueuse/shared"; // 导入封装的上传接口

const customUploadAvatar = async (options) => {
  try {
    const res = await uploadAvatar(options.file); // 调用封装的上传接口
    if (res.success) {
      settingForm.value.portrait = res.data.url; // 存储返回的头像URL
      ElMessage.success("头像上传成功");
    } else {
      ElMessage.error("头像上传失败：" + res.message);
    }
  } catch (error) {
    ElMessage.error("头像上传异常，请重试");
    console.error("自定义上传头像异常：", error);
  }
};


// 头像上传成功回调
const handleAvatarSuccess = (res) => {
  if (res.success) {
    settingForm.value.portrait = res.data.url; // 存储临时头像URL
    ElMessage.success("头像上传成功");
  } else {
    ElMessage.error("头像上传失败：" + res.message);
  }
};

// 确认修改账户信息
const handleConfirmSetting = async () => {
  if (!settingForm.value.name.trim()) {
    ElMessage.warning("姓名不能为空！");
    return;
  }

  settingLoading.value = true;
  try {
    // 调用更新接口
    const res = await updateMemberInfo({
      id: studentId.value,
      name: settingForm.value.name.trim(),
      portrait: settingForm.value.portrait
    });

    if (res.success) {
      // 更新本地存储和页面数据
      studentName.value = settingForm.value.name.trim();
      studentPortrait.value = settingForm.value.portrait;
      localStorage.setItem("studentName", studentName.value);
      localStorage.setItem("studentPortrait", studentPortrait.value);
      ElMessage.success("设置保存成功");
      showSettingDialog.value = false;
    } else {
      ElMessage.error("保存失败：" + (res.message || "服务器异常"));
    }
  } catch (error) {
    ElMessage.error("保存失败，请重试");
    console.error("更新用户信息异常：", error);
  } finally {
    settingLoading.value = false;
  }
};

// 初始化加载
onMounted(() => {
  loadAvailableLessons();
});

</script>

<style scoped>
.student-course-main-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

/* 顶部导航 */
.header {
  height: 50px;
  line-height: 50px;
  background-color: #409eff;
  color: #fff;
  padding: 0 15px;
  text-align: right;
  position: relative;
}

.setting-btn {
  color: #fff;
  position: absolute;
  left: 15px;
  top: 0;
  font-size: 16px;
}

.setting-btn:hover {
  color: #e6e6e6;
}

.user-name {
  font-size: 14px;
}

/* 底部Tab菜单 */
.tab-menu {
  display: flex;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background-color: #fff;
  border-top: 1px solid #e6e6e6;
  z-index: 99;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  color: #666;
}

.tab-item.active {
  color: #409eff;
}

.tab-item i {
  font-size: 16px;
  margin-bottom: 2px;
}

/* 内容区域 */
.content {
  flex: 1;
  padding: 15px;
  padding-bottom: 60px;
  overflow-y: auto;
}

.account-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* 课程列表 */
.course-list {
  width: 100%;
}

.lesson-item {
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.lesson-info h3 {
  font-size: 16px;
  color: #333;
  margin: 0 0 5px 0;
}

.lesson-info p {
  font-size: 12px;
  color: #666;
  margin: 0 0 3px 0;
}

.empty {
  text-align: center;
  padding: 50px 0;
  color: #999;
  font-size: 14px;
}

/* 状态标签 */
.status-label {
  color: #409eff !important;
  font-weight: 500;
}

.status-tag {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: not-allowed;
}

.status-tag.已完成 {
  color: #67c23a;
  background-color: #f0f9eb;
  border: 1px solid #e1f3d8;
}

.status-tag.已取消 {
  color: #909399;
  background-color: #f4f4f5;
  border: 1px solid #e9e9eb;
}

.status-tag.未知 {
  color: #e6a23c;
  background-color: #fdf6ec;
  border: 1px solid #faecd8;
}

/* 账户信息 */
.account-info {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
  width: 80%;
  max-width: 300px;
  text-align: center;
}

.logout-btn {
  width: 80%;
  max-width: 300px;
  height: 40px;
}

/* 头像样式：核心 - X字符兜底 */
.avatar-wrapper {
  margin-bottom: 15px;
  position: relative;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e6e6e6;
}

/* X字符占位符样式 */
.avatar-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #e6e6e6;
  color: #666;
  font-size: 32px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #e6e6e6;
}

/* 弹窗头像上传样式 */
.avatar-uploader {
  text-align: center;
}

.avatar-uploader .el-upload {
  border: none;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader-icon {
  display: none; /* 隐藏默认加号，使用X字符 */
}

/* 弹窗样式 */
.dialog-footer {
  text-align: right;
}
</style>