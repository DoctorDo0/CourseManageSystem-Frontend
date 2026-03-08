<template>
  <!-- 搜索区 -->
  <div class="search">
    <el-form inline ref="formRef" :model="searchModel">

      <el-form-item label="课程代码:" prop="courseId">
        <el-input v-model="searchModel.courseId" placeholder="输入课程代码"/>
      </el-form-item>

      <el-form-item label="课程名称:" prop="courseName">
        <el-input v-model="searchModel.courseName" placeholder="输入课程名称"/>
      </el-form-item>

      <el-form-item label="注册日期:" prop="registerDateRange" style="width: 360px">
        <el-date-picker v-model="searchModel.registerDateRange"
                        type="daterange"
                        format="YYYY-MM-DD"
                        value-format="YYYY-MM-DD"
                        range-separator="~"
                        start-placeholder="起始"
                        end-placeholder="结束"
        />
      </el-form-item>

      <el-form-item label="注册操作人:" prop="registerBy">
        <el-input v-model="searchModel.registerBy" placeholder="输入注册操作人员"/>
      </el-form-item>

      <el-form-item label="修改日期:" prop="updateDateRange" style="width: 360px">
        <el-date-picker v-model="searchModel.updateDateRange"
                        type="daterange"
                        format="YYYY-MM-DD"
                        value-format="YYYY-MM-DD"
                        range-separator="~"
                        start-placeholder="起始"
                        end-placeholder="结束"
        />
      </el-form-item>

      <el-form-item label="修改操作人:" prop="updateBy">
        <el-input v-model="searchModel.updateBy" placeholder="输入修改操作人员"/>
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
    <div class="action-right-button">
      <el-button v-if="showDeleteFlag" type="warning" :icon="RefreshLeft" @click="restoreAll">恢复</el-button>
      <el-button :type="showDeleteButtonType" :icon="showDeleteButtonIcon" @click="showDelete">查看被删除内容
      </el-button>
    </div>
  </div>

  <!-- 数据区 -->
  <div class="grid">
    <el-table class="tbl" v-bind:data="courses" stripe border v-on:row-click="tableRowClick" height="500" ref="tbl">
      <el-table-column type="selection" align="center" fixed/>
      <el-table-column prop="id" label="ID" width="80" fixed/>
      <el-table-column prop="courseId" label="课程代码" width="100" fixed/>
      <el-table-column prop="courseName" label="课程名称" width="140" fixed/>
      <el-table-column prop="description" label="课程描述" width="120" align="center"/>
      <el-table-column prop="registerDate" label="注册起始日期" width="160" align="center"/>
      <el-table-column prop="registerBy" label="注册操作人" width="120" align="center"/>
      <el-table-column prop="updateDate" label="最后更新日期" width="160" align="center"/>
      <el-table-column prop="updateBy" label="更新操作人" width="120" align="center"/>
      <el-table-column width="150" label="操作">
        <template #default="scope">
          <el-button v-if="!showDeleteFlag" type="primary" size="small" @click="rowEdit(scope.row)">编辑</el-button>
          <el-button v-if="!showDeleteFlag" type="danger" size="small" @click="rowDelete(scope.row)">删除</el-button>
          <el-button v-if="showDeleteFlag" type="warning" size="small" @click="rowRestore(scope.row)">恢复</el-button>
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
    <el-form label-width="100" label-position="right" :model="courseModel" ref="courseFormRef" :rules="rules">
      <el-row :gutter="20">
        <el-col :span="12">

          <el-form-item label="课程代码：" prop="courseId">
            <el-input v-model="courseModel.courseId" placeholder="请输入课程代码" :readonly="mode.valueOf() ==='edit'"
                      :disabled="mode.valueOf() ==='edit'"/>
          </el-form-item>

        </el-col>

        <el-col :span="12">

          <el-form-item label="课程名称：" prop="courseName">
            <el-input v-model="courseModel.courseName" placeholder="请输入课程名称"/>
          </el-form-item>

        </el-col>

      </el-row>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="课程描述：" prop="description">
            <el-input type="textarea" v-model="courseModel.description" placeholder="请输入课程描述"
                      input-style="height:100px"/>
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
import {ref, shallowRef, onMounted, reactive, toRaw, nextTick} from "vue";
import {
  findAll,
  deleteByIds as apiDeleteByIds,
  save,
  update,
  restoreByIds as apiRestoreByIds
} from "@/api/CourseApi.js";
import {
  CirclePlus,
  Delete,
  Edit,
  Hide,
  Refresh,
  RefreshLeft,
  Search,
  View
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

//页面就绪后执行
onMounted(() => {
  search(pageinfo.currentPageNo, pageinfo.currentPageSize);
});

//封装表单查询条件
let searchModel = ref({
  courseId: null,
  courseName: null,
  registerDateRange: [],
  registerBy: null,
  updateDateRange: [],
  updateBy: null,
  active: null,
});

//封装查询功能，含更新数据
async function search(pageNo = pageinfo.pageNo, pageSize = pageinfo.pageSize, params = {}) {
  let resp = await findAll(pageNo, pageSize, params);
  courses.value = resp.data.records;
  pageinfo.currentPageNo = resp.data.current;
  pageinfo.currentPageSize = resp.data.size;
  pageinfo.total = resp.data.total;
}

//查询按钮功能
function doSearch() {
  let params = toRaw(searchModel.value);
  params.active = !showDeleteFlag;
  search(pageinfo.currentPageNo, pageinfo.currentPageSize, params);
}

//表单对象
const formRef = ref();

//重置按钮功能
function resetForm() {
  formRef.value.resetFields();//重置表单
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
const courseModel = ref({
  id: null,
  courseId: null,
  courseName: null,
  description: null,
  active: null
});

//新增/修改表单对象
const courseFormRef = ref();

//校验规则
const rules = {
  courseId: [
    {required: true, message: "ID不可为空", trigger: "blur"},
    {min: 6, max: 12, message: "ID必须介于6~12位", trigger: "blur"}
  ],
  courseName: [
    {required: true, message: "课程名称不可为空", trigger: "blur"},
    {min: 2, max: 20, message: "课程名称必须介于2~20位", trigger: "blur"}
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
    dlgTitle.value = "修改课程";
    showDlg.value = true;

    nextTick(() => {
      mode.value = "edit";
      row = cloneDeep(row);//克隆出的新对象没有响应式能力
      row.password = null;

      courseModel.value = row;
    });
  }
}

//右侧按钮编辑单行
function rowEdit(row) {
  nextTick(() => {
    mode.value = "edit";
    row = cloneDeep(row);//克隆出的新对象没有响应式能力
    row.password = null;

    courseModel.value = row;
    dlgTitle.value = "修改课程";
    showDlg.value = true;
  });
}

//提交课程表单
function doSubmit() {
  courseFormRef.value.validate(async valid => {
    if (valid) {
      let params = toRaw(courseModel.value);
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
}

//按钮切换字段及对象
let showDeleteFlag = false;
const showDeleteButtonType = ref("info")
const showDeleteButtonIcon = shallowRef(Hide)

//点击切换按钮，显示被删除的内容
function showDelete() {
  if (showDeleteFlag === false) {
    showDeleteFlag = true;
    showDeleteButtonType.value = "warning";
    showDeleteButtonIcon.value = View;
    doSearch();
  } else if (showDeleteFlag === true) {
    showDeleteFlag = false;
    showDeleteButtonType.value = "info";
    showDeleteButtonIcon.value = Hide;
    doSearch();
  }
}

//多行恢复功能
function restoreAll() {
  //获取选中行
  let rows = tbl.value.getSelectionRows();
  let ids = rows.map(t => t.id);
  if (ids.length === 0) {
    ElMessage.error("未选择要恢复的行");
    return;
  }

  ElMessageBox.confirm("是否确认恢复选中的行?", "警告", {
    type: "warning"
  }).then(() => {
    //点击ok操作
    restoreByIds(ids);
  }).catch(() => {
    //点击cancel操作
    ElMessage.info("已取消")
  });
}

//右侧按钮恢复单行
function rowRestore(row) {
  ElMessageBox.confirm("是否确认恢复当前行?", "警告", {
    type: "warning"
  }).then(() => {
    //点击ok操作
    restoreByIds([row.id]);
  }).catch(() => {
    //点击cancel操作
    ElMessage.info("已取消")
  });
}

//恢复数据传递
async function restoreByIds(ids) {
  let resp = await apiRestoreByIds(ids);
  ElMessage.success("恢复操作成功，共恢复" + resp.data + "条记录");
  doSearch();
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