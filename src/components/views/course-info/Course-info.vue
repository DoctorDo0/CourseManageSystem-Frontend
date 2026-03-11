<template>
  <!-- 搜索区 -->
  <div class="search">
    <el-form inline ref="formRef" :model="searchModel">
      <el-form-item label="课程代码:" prop="courseId">
        <el-input v-model="searchModel.course.courseId" placeholder="输入课程代码"/>
      </el-form-item>

      <el-form-item label="课程名称:" prop="courseName">
        <el-input v-model="searchModel.course.courseName" placeholder="输入课程名称"/>
      </el-form-item>

      <el-form-item label="教师工号:" prop="teacherId">
        <el-input v-model="searchModel.teacher.teacherId" placeholder="输入教师工号"/>
      </el-form-item>

      <el-form-item label="教师名称:" prop="teacherName">
        <el-input v-model="searchModel.teacher.name" placeholder="输入教师名称"/>
      </el-form-item>

      <el-form-item label="课程日期:" prop="courseDate">
        <el-date-picker
            v-model="searchModel.courseDate"
            type="date"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            placeholder="输入课程日期"
        />
      </el-form-item>

      <el-form-item label="课时:" prop="coursePeriod">
        <el-select v-model="searchModel.coursePeriod" placeholder="选择课时" style="width: 240px">
          <el-option
              v-for="item in coursePeriodOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="课程地点:" prop="courseAddress">
        <el-input v-model="searchModel.courseAddress" placeholder="输入课程地点"/>
      </el-form-item>

    </el-form>
  </div>

  <!-- 按钮区 -->
  <div class="action">
    <div class="action-left-button">
      <el-button type="primary" :icon="CirclePlus" @click="doAdd">新增</el-button>
      <el-button type="primary" :icon="Edit" @click="doEdit">修改</el-button>
      <el-button type="primary" :icon="Search" @click="doSearch">查询</el-button>
      <el-button type="primary" :icon="Refresh" @click="resetForm">重置</el-button>
      <el-button type="danger" :icon="Delete" @click="doDelete">删除</el-button>
    </div>
  </div>

  <!-- 数据区 -->
  <div class="grid">
    <el-table class="tbl" v-bind:data="courses" stripe border v-on:row-click="tableRowClick" height="500" ref="tbl">
      <el-table-column type="selection" align="center" fixed/>
      <el-table-column prop="id" label="ID" width="80" fixed/>
      <el-table-column prop="course.courseId" label="课程代码" width="100" fixed/>
      <el-table-column prop="course.courseName" label="课程名称" width="140" fixed/>
      <el-table-column prop="teacher.teacherId" label="教师工号" width="100" fixed/>
      <el-table-column prop="teacher.name" label="教师名称" width="120" fixed/>
      <el-table-column prop="teacher.gender" label="教师性别" width="60"/>
      <el-table-column prop="courseDate" label="课程日期" width="120"/>
      <el-table-column prop="coursePeriod" label="课时" width="60"/>
      <el-table-column prop="courseAddress" label="课程地点" width="100"/>
      <el-table-column prop="course.credits" label="课程学分" width="100"/>
      <el-table-column prop="maxNumber" label="课程可选最大人数" width="100"/>
      <el-table-column prop="course.description" label="课程描述" width="140" align="center"/>
      <el-table-column prop="course.id" label="课程ID" width="60"/>
      <el-table-column prop="teacher.id" label="教师ID" width="60"/>
      <el-table-column width="150" label="操作">
        <template #default="scope">
          <el-button type="primary" size="small" @click="rowEdit(scope.row)">编辑</el-button>
          <el-button type="danger" size="small" @click="rowDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

  </div>

  <!-- 分页 -->
  <div class="pagination">
    <el-pagination
        v-model:current-page="pageinfo.currentPageNo"
        v-model:page-size="pageinfo.currentPageSize"
        v-bind:page-sizes="[10, 20, 30, 50, 100]"
        background
        layout="total, sizes, prev, pager, next, jumper"
        v-bind:total="pageinfo.total"
        v-on:change="pageChange"
    />
  </div>

  <!--新增或修改的窗口-->
  <el-dialog v-model="showDlg" :title="dlgTitle" width="700"
             :close-on-click-modal="false" draggable :overflow="false" @close="closeDlg">
    <el-form label-width="100" label-position="right" :model="courseInfoModel" ref="courseFormRef" :rules="rules">
      <el-row :gutter="20">
        <el-col :span="12">

          <el-form-item label="课程ID：" prop="courseId">
            <el-select v-model="courseInfoModel.courseId" placeholder="请输入课程ID" value-key="id"
                       :readonly="mode.valueOf() ==='edit'" :disabled="mode.valueOf() ==='edit'"
                       filterable clearable>
              <el-option
                  v-for="item in courseMainInfoOptions"
                  :key="item.id"
                  :label="item.courseId+' -- '+item.courseName"
                  :value="item.id"
              >
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="课程日期：" prop="courseDate">
            <el-date-picker v-model="courseInfoModel.courseDate" type="date" value-format="YYYY-MM-DD"
                            format="YYYY-MM-DD" placeholder="请输入课程日期" style="width: 100%"/>
          </el-form-item>

          <el-form-item label="课程最大人数：" prop="maxNumber">
            <el-input v-model="courseInfoModel.maxNumber" placeholder="请输入课程最大人数"
                      :readonly="mode.valueOf() ==='edit'" :disabled="mode.valueOf() ==='edit'"/>
          </el-form-item>

        </el-col>

        <el-col :span="12">

          <el-form-item label="教师ID：" prop="teacherId">
            <el-select v-model="courseInfoModel.teacherId" placeholder="请输入教师ID" value-key="id"
                       filterable clearable>
              <el-option
                  v-for="item in teacherMainInfoOptions"
                  :key="item.id"
                  :label="item.teacherId+' -- '+item.name"
                  :value="item.id"
              >
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="课时：" prop="coursePeriod">
            <el-select v-model="courseInfoModel.coursePeriod" placeholder="选择课时" style="width: 240px">
              <el-option
                  v-for="item in coursePeriodOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="课程地点：" prop="courseAddress">
            <el-input v-model="courseInfoModel.courseAddress" placeholder="请输入课程地点"/>
          </el-form-item>

        </el-col>

      </el-row>

    </el-form>
    <template #footer>
      <div>
        <el-button type="primary" @click="doSubmit">确定</el-button>
        <el-button @click="showDlg=false">取消</el-button>
      </div>
    </template>
  </el-dialog>

</template>

<style scoped>
.action {
  display: flex;
  justify-content: space-between; /* 左右两端对齐 */
  align-items: center; /* 垂直居中 */
  /*padding: 16px;
  background-color: #f5f7fa;
  border-radius: 4px;*/
}

.action-left-button, .action-right-button {
  display: flex;
  /*gap: 12px;  !* 按钮之间的间距 *!*/
}

.tbl {
  width: 100%;
}

.pagination {
  margin-top: 10px;
}

.grid {
  margin-top: 10px;
}

</style>

<script setup>
import {ref, onMounted, reactive, toRaw, nextTick} from "vue";
import {
  findAll,
  deleteByIds as apiDeleteByIds,
  save,
  update,
  getCourseMainInfo,
  getTeacherMainInfo
} from "@/api/CourseInfoApi.js";
import {
  CirclePlus,
  Delete,
  Edit,
  Refresh,
  Search,
} from "@element-plus/icons-vue";
import {ElMessage, ElMessageBox} from "element-plus";
//深度克隆
import {cloneDeep} from "lodash";

//表格数据
const courses = ref();

//页面数据
const pageinfo = reactive({
  currentPageNo: 1,
  currentPageSize: 20,
  total: 0,
});

//新增的课程与教师下拉列表(选择器)
const courseMainInfoOptions = ref();
const teacherMainInfoOptions = ref();

//页面就绪后执行
onMounted(() => {
  search(pageinfo.currentPageNo, pageinfo.currentPageSize);
  setCourseMainInfoOptions();
  setTeacherMainInfoOptions();
});

async function setCourseMainInfoOptions() {
  let resp = await getCourseMainInfo();
  courseMainInfoOptions.value = resp.data.map(item => ({
    id: item.id,
    courseId: item.courseId,
    courseName: item.courseName,
    credits: item.credits
  }));
}

async function setTeacherMainInfoOptions() {
  let resp = await getTeacherMainInfo();
  teacherMainInfoOptions.value = resp.data.map(item => ({
    id: item.id,
    teacherId: item.teacherId,
    name: item.name
  }));
}

//封装表单查询条件
let searchModel = ref({
  courseId: null,
  teacherId: null,
  courseDate: null,
  coursePeriod: null,
  courseAddress: null,
  course: {
    id: null,
    courseId: null,
    courseName: null,
    credits: null,
    description: null
  },
  teacher: {
    id: null,
    teacherId: null,
    name: null,
    gender: null
  }
});

//查询与新增的课时下拉列表(选择器)
const coursePeriodOptions = [
  {
    value: '',
    label: '任意不限',
  },
  {
    value: '1',
    label: '1',
  },
  {
    value: '2',
    label: '2',
  },
  {
    value: '3',
    label: '3',
  },
  {
    value: '4',
    label: '4',
  },
]

//封装查询功能，含更新数据
async function search(pageNo = pageinfo.pageNo, pageSize = pageinfo.pageSize, params = {}) {
  let resp = await findAll(pageNo, pageSize, params);
  courses.value = resp.data.list;
  pageinfo.currentPageNo = resp.data.pageNum;
  pageinfo.currentPageSize = resp.data.pageSize;
  pageinfo.total = resp.data.total;
}

//查询按钮功能
function doSearch() {
  let params = toRaw(searchModel.value);
  search(pageinfo.currentPageNo, pageinfo.currentPageSize, params);
}

//表单对象
const formRef = ref();

//重置按钮功能
function resetForm() {
  formRef.value.resetFields();//重置表单
  // 逐个重置嵌套字段
  searchModel.value.course.courseId = null;
  searchModel.value.teacher.teacherId = null;
  searchModel.value.course.courseName = null;
  searchModel.value.teacher.name = null;

  // 清除验证状态
  formRef.value?.clearValidate();
}

//多行删除功能
function doDelete() {
  //获取选中行
  let rows = tbl.value.getSelectionRows();
  let ids = rows.map(t => t.id);
  if (ids.length === 0) {
    ElMessage.error("未选择要删除的行");
    return;
  }

  ElMessageBox.confirm("是否确认删除选中的行?", "警告", {
    type: "warning"
  }).then(() => {
    //点击ok操作
    deleteByIds(ids);
  }).catch(() => {
    //点击cancel操作
    ElMessage.info("已取消")
  });
}

//右侧按钮删除单行
function rowDelete(row) {
  ElMessageBox.confirm("是否确认删除当前行?", "警告", {
    type: "warning"
  }).then(() => {
    //点击ok操作
    deleteByIds([row.id]);
  }).catch(() => {
    //点击cancel操作
    ElMessage.info("已取消")
  });
}

//删除数据传递
async function deleteByIds(ids) {
  let resp = await apiDeleteByIds(ids);
  ElMessage.success("删除操作成功，共删除" + resp.data + "条记录");
  doSearch();
}

//操作模式
const mode = ref("view");//add:新增，edit:修改
//是否显示对话框
const showDlg = ref(false);
//对话框标题
const dlgTitle = ref();
//新增表单数据模型
const courseInfoModel = ref({
  courseId: null,
  teacherId: null,
  maxNumber: null,
  courseDate: null,
  coursePeriod: null,
  courseAddress: null,
  course: {
    id: null,
    courseId: null,
    courseName: null,
    credits: null,
    description: null
  },
  teacher: {
    id: null,
    teacherId: null,
    name: null,
    gender: null
  }
});

function setInitialFormData() {
  courseInfoModel.value.courseId = null;
  courseInfoModel.value.teacherId = null;
  courseInfoModel.value.maxNumber = null;
  courseInfoModel.value.courseDate = null;
  courseInfoModel.value.coursePeriod = null;
  courseInfoModel.value.courseAddress = null;
  courseInfoModel.value.course.id = null;
  courseInfoModel.value.course.courseId = null;
  courseInfoModel.value.course.courseName = null;
  courseInfoModel.value.course.credits = null;
  courseInfoModel.value.course.description = null;
  courseInfoModel.value.teacher.id = null;
  courseInfoModel.value.teacher.teacherId = null;
  courseInfoModel.value.teacher.name = null;
  courseInfoModel.value.teacher.gender = null;
}

//新增/修改表单对象
const courseFormRef = ref();

//校验规则
const rules = {
  courseId: [
    {required: true, message: "课程ID不可为空", trigger: "blur"}
  ],
  teacherId: [
    {required: true, message: "教师ID不可为空", trigger: "blur"}
  ],
  maxNumber: [
    {required: true, message: "课程最大人数不可为空", trigger: "blur"}
  ],
  courseDate: [
    {required: true, message: "课程日期不可为空", trigger: "blur"}
  ],
  coursePeriod: [
    {required: true, message: "课时不可为空", trigger: "blur"}
  ],
  courseAddress: [
    {required: true, message: "课程地点不可为空", trigger: "blur"}
  ]
};

//新增功能
function doAdd() {
  mode.value = "add";
  showDlg.value = true;
  dlgTitle.value = "新增课程";
}

//编辑功能
function doEdit() {
  let rows = tbl.value.getSelectionRows();//获取所有选中行
  if (rows.length === 0) {
    ElMessage.warning("请选中您要修改的行");
  } else if (rows.length > 1) {
    ElMessage.error("您一次只能修改一行");
  } else {
    let row = toRaw(rows[0]);
    //在下一个时间滴答内，执行操作
    nextTick(() => {
      mode.value = "edit";
      row = cloneDeep(row);//克隆出的新对象没有响应式能力
      row.password = null;

      courseInfoModel.value = row;
      dlgTitle.value = "修改课程";
      showDlg.value = true;
    });
  }
}

//右侧按钮编辑单行
function rowEdit(row) {
  nextTick(() => {
    mode.value = "edit";
    row = cloneDeep(row);//克隆出的新对象没有响应式能力
    row.password = null;

    courseInfoModel.value = row;
    dlgTitle.value = "修改课程";
    showDlg.value = true;
  });
}

//提交课程表单
function doSubmit() {
  courseFormRef.value.validate(async valid => {
    if (valid) {
      let params = toRaw(courseInfoModel.value);
      if (mode.value === "add") {
        let resp = await save(params);
        if (resp.success) {
          ElMessage.success("保存课程信息成功");
          showDlg.value = false;
          doSearch();
        } else {
          ElMessage.error(resp.message || "保存课程信息失败");
        }
      } else if (mode.value === "edit") {
        let resp = await update(params);
        if (resp.success) {
          ElMessage.success("修改课程信息成功");
          showDlg.value = false;
          doSearch();
        } else {
          ElMessage.error(resp.message || "修改课程信息失败");
        }
      }
    }
  });
}

//关闭对话框时触发
function closeDlg() {
  courseFormRef.value.resetFields();
  //TODO:
  setInitialFormData();//bug fixed: 用于修复，当第一次进入界面后，先点击编辑后，再点击新增，导致新增界面回显为第一次点击编辑的数据的bug
}

//表格对象
const tbl = ref();

//行点击事件
function tableRowClick(row) {
  tbl.value.toggleRowSelection(row);
}

//页面导航功能
function pageChange() {
  doSearch();
}

</script>