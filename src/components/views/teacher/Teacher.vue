<template>
  <!-- 搜索区 -->
  <div class="search">
    <el-form inline ref="formRef" :model="searchModel">

      <el-form-item label="教师ID:" prop="teacherId">
        <el-input v-model="searchModel.teacherId" placeholder="输入教师ID"/>
      </el-form-item>

      <el-form-item label="姓名:" prop="name">
        <el-input v-model="searchModel.name" placeholder="输入姓名"/>
      </el-form-item>

      <el-form-item label="性别:" prop="gender">
        <el-select v-model="searchModel.gender" :empty-values="[null]" :value-on-clear="null" style="width: 120px">
          <el-option label="不限" value=""/>
          <el-option label="男" value="男"/>
          <el-option label="女" value="女"/>
        </el-select>
      </el-form-item>

      <el-form-item label="出生日期:" prop="birthdayRange" style="width: 360px">
        <el-date-picker v-model="searchModel.birthdayRange"
                        type="daterange"
                        format="YYYY-MM-DD"
                        value-format="YYYY-MM-DD"
                        range-separator="~"
                        start-placeholder="起始"
                        end-placeholder="结束"
        />
      </el-form-item>

      <el-form-item label="手机号:" prop="phone">
        <el-input v-model="searchModel.phone" placeholder="输入手机号"/>
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
      <el-button type="success" :icon="Download" @click="doExport">导出</el-button>
      <el-button type="warning" :icon="Upload" @click="importAll">导入</el-button>
    </div>
    <div class="action-right-button">
      <el-button v-if="showDeleteFlag" type="warning" :icon="RefreshLeft" @click="restoreAll">恢复</el-button>
      <el-button :type="showDeleteButtonType" :icon="showDeleteButtonIcon" @click="showDelete">查看被删除内容
      </el-button>
    </div>
  </div>

  <!-- 数据区 -->
  <div class="grid">
    <!--简写形式 v-bind:可简写为: v-on:可简写为@-->
    <el-table class="tbl" v-bind:data="teachers" stripe border v-on:row-click="tableRowClick" height="500" ref="tbl">
      <el-table-column type="selection" align="center" fixed/>
      <el-table-column prop="id" label="ID" width="80" fixed/>
      <el-table-column prop="teacherId" label="教师工号" width="100" fixed/>

      <el-table-column prop="avatar" label="头像" width="100" fixed="left">
        <template #default="scope">
          <div class="row-avatar" :style="'background-image: url('+scope.row.avatar+')'"></div>
        </template>
      </el-table-column>

      <el-table-column prop="name" label="姓名" width="140" fixed/>
      <el-table-column prop="gender" label="性别" width="60" align="center"/>
      <el-table-column prop="birthday" label="出生日期" width="120" align="center"/>
      <el-table-column prop="phone" label="手机号" width="160"/>
      <el-table-column prop="email" label="邮箱" width="160"/>
      <el-table-column prop="wechat" label="微信号" width="160"/>
      <el-table-column prop="qq" label="QQ号" width="160"/>
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
    <el-form label-width="100" label-position="right" :model="teacherModel" ref="teacherFormRef" :rules="rules">
      <el-row :gutter="20">
        <el-col :span="12">

          <el-form-item label="教师工号：" prop="teacherId">
            <el-input v-model="teacherModel.teacherId" placeholder="请输入教师工号" :readonly="mode.valueOf() ==='edit'"
                      :disabled="mode.valueOf() ==='edit'"/>
          </el-form-item>
          <el-form-item label="密码：" prop="teacherPassword">
            <el-input type="password" v-model="teacherModel.teacherPassword" show-password placeholder="请输入密码"/>
          </el-form-item>
          <el-form-item label="姓名：" prop="name">
            <el-input v-model="teacherModel.name" placeholder="请输入姓名"/>
          </el-form-item>
          <el-form-item label="出生日期：" prop="birthday">
            <el-date-picker v-model="teacherModel.birthday" type="date" placeholder="请选择出生日期"
                            style="width: 100%"/>
          </el-form-item>

        </el-col>

        <el-col :span="12">
          <el-form-item label="头像：" prop="avatar">
            <!-- 上传表单 -->
            <el-upload class="avatar-uploader" action="/api/teacher/avatar" :headers="headers"
                       :show-file-list="false" :on-success="avatarUploadSuccess">
              <div class="avatar-img" v-if="teacherModel.avatar"
                   :style="'background-image: url('+teacherModel.avatar+')'"></div>
              <el-icon class="avatar-icon">
                <Plus/>
              </el-icon>
            </el-upload>
          </el-form-item>
        </el-col>

      </el-row>

      <el-row :gutter="20">

        <el-col :span="12">
          <el-form-item label="性别：" prop="gender">
            <el-radio-group v-model="teacherModel.gender">
              <el-radio value="男">男</el-radio>
              <el-radio value="女">女</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="手机号：" prop="phone">
            <el-input type="tel" v-model="teacherModel.phone" placeholder="请输入手机号"/>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="邮箱号：" prop="email">
            <el-input v-model="teacherModel.email" placeholder="请输入邮箱号"/>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="微信号：" prop="wechat">
            <el-input v-model="teacherModel.wechat" placeholder="请输入微信号"/>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="QQ号：" prop="qq">
            <el-input v-model="teacherModel.qq" placeholder="请输入QQ号"/>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="备注：" prop="description">
            <el-input type="textarea" v-model="teacherModel.description" placeholder="请输入备注"
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

  <!-- excel上传对话框 -->
  <el-dialog title="导入教师" v-model="showImportDialog" draggable @close="onCloseImportDialog" destroy-on-close
             style="width: 400px">
    <el-form ref="importFormRef">
      <el-form-item label="选择文件：">

        <el-upload action="/api/teacher/import" :headers="headers" :on-success="onImportSuccess"
                   accept=".xlsx" :auto-upload="false" :limit="1" ref="uploadRef">
          <template #trigger>
            <el-button type="primary">选择教师列表文件（.xlsx）</el-button>
          </template>
        </el-upload>

      </el-form-item>
    </el-form>
    <template #footer>
      <div class="footer">
        <el-button type="primary" @click="submitImportExcel">确定</el-button>
        <el-button @click="showImportDialog = false">取消</el-button>
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

.avatar-uploader {
  position: relative;
  /*width: 100%;*/
  width: 170px;
  height: 170px; /*影响高度，进一步影响头像icon位置*/
  border: 1px dashed #ccc;
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-img {
  /*width: 100%;*/
  width: 170px;
  height: 170px;
  border: 1px dashed #ccc;
  border-radius: 8px;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: contain;
}

.avatar-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  margin-top: -15px;
  margin-left: -15px;
  display: block;
  font-size: 30px;
}

.row-avatar {
  width: 80px;
  height: 80px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
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
} from "@/api/TeacherApi.js";
import {
  CirclePlus,
  Delete,
  Download,
  Edit,
  Hide,
  Plus,
  Refresh,
  RefreshLeft,
  Search,
  Upload,
  View
} from "@element-plus/icons-vue";
import {ElMessage, ElMessageBox} from "element-plus";
//深度克隆
import {cloneDeep} from "lodash";
import {getJwt} from "@/api/JwtApi.js";

//表格数据
const teachers = ref();

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
  teacherId: null,
  avatar: null,
  name: null,
  gender: null,
  birthdayRange: [],
  phone: null,
  registerDateRange: [],
  registerBy: null,
  updateDateRange: [],
  updateBy: null,
  active: null,
});

//封装查询功能，含更新数据
async function search(pageNo = pageinfo.pageNo, pageSize = pageinfo.pageSize, params = {}) {
  let resp = await findAll(pageNo, pageSize, params);
  teachers.value = resp.data.list;
  pageinfo.currentPageNo = resp.data.pageNum;
  pageinfo.currentPageSize = resp.data.pageSize;
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
const teacherModel = ref({
  teacherId: null,
  teacherPassword: null,
  name: null,
  gender: "男",
  birthday: null,
  phone: null,
  email: null,
  wechat: null,
  qq: null,
  description: null,
  avatar: null
});

//新增/修改表单对象
const teacherFormRef = ref();

//校验规则
const rules = {
  teacherId: [
    {required: true, message: "ID不可为空", trigger: "blur"},
    {min: 6, max: 12, message: "ID必须介于6~12位", trigger: "blur"}
  ],
  teacherPassword: [
    {validator: validateFormPass, trigger: "blur"}
  ],
  name: [
    {required: true, message: "姓名不可为空", trigger: "blur"},
    {min: 2, max: 20, message: "姓名必须介于2~20位", trigger: "blur"}
  ],
  gender: [
    {validator: validateFormGender, trigger: "blur"}
  ],
  birthday: [
    {type: "date", message: "出生日期格式不正确", trigger: "blur"}
  ],
  /*phone: [
    {required: true, message: "手机号不可为空", trigger: "blur"},
    {validator: validateFormPhone, trigger: "blur"}
  ],*/
  email: [
    {type: "email", message: "邮箱格式不正确", trigger: "blur"}
  ]
};

//性别校验
function validateFormGender(rule, value, cb) {
  if (value === "男" || value === "女") {
    cb();//无错误
  } else {
    cb(new Error("性别只能是男或女"));
  }
}

//手机号校验
function validateFormPhone(rule, value, cb) {
  if (value.match(/^\d{11}$/)) {
    cb();
  } else {
    cb(new Error("手机号必须是11位数字格式"));
  }
}

//密码校验
function validateFormPass(rule, value, cb) {
  if (value == null || value.trim() === "") {//空
    if (mode.value === "add") {
      cb(new Error("密码不可为空"));
    } else {
      cb();
    }
  } else {
    if (value.length < 6 || value.length > 12) {
      cb(new Error("密码必须介于6~12位之间"));
    } else {
      cb();
    }
  }
}

//新增功能
function doAdd() {
  mode.value = "add";
  showDlg.value = true;
  dlgTitle.value = "新增教师";
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
    teacherModel.value = row;
    dlgTitle.value = "修改教师";

    nextTick(() => {
      mode.value = "edit";
      row = cloneDeep(row);//克隆出的新对象没有响应式能力
      row.password = null;

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

    teacherModel.value = row;
    dlgTitle.value = "修改教师";
    showDlg.value = true;
  });
}

//提交教师表单
function doSubmit() {
  teacherFormRef.value.validate(async valid => {
    if (valid) {
      let params = toRaw(teacherModel.value);
      if (mode.value === "add") {
        let resp = await save(params);
        if (resp.success) {
          ElMessage.success("保存教师信息成功");
          showDlg.value = false;
          doSearch();
        } else {
          ElMessage.error(resp.message || "保存教师信息失败");
        }
      } else if (mode.value === "edit") {
        let resp = await update(params);
        if (resp.success) {
          ElMessage.success("修改教师信息成功");
          showDlg.value = false;
          doSearch();
        } else {
          ElMessage.error(resp.message || "修改教师信息失败");
        }
      }
    }
  });
}

//关闭对话框时触发
function closeDlg() {
  teacherFormRef.value.resetFields();
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

//////////////////////////////////////////////////////////////
//导出到excel
function doExport() {
  let jwt = getJwt();

  //TODO:
  // 后台包含处理数据能力，此处可注释
  //查询条件
  let params = toRaw(searchModel);
  if (params.birthdayRange) {
    params.birthdayFrom = params.birthdayRange[0];
    params.birthdayTo = params.birthdayRange[1];
    delete params.birthdayRange;
  }

  //旧版params为未展开的原始数据
  // let args = Object.entries(params).filter(([k, v]) => v != null).map(([k, v]) => k + "=" + v).join("&");
  let args = Object.entries(params.value).filter(([k, v]) => v != null).map(([k, v]) => k + "=" + v).join("&");

  // console.log(args);
  // console.log(params);
  // console.log(params.value);

  location.href = "/api/teacher/export?jwt=" + jwt + "&" + args;
}

//////////////////////////////////////////////////////////////
const showImportDialog = ref(false);
const importFormRef = ref();
//请求头，jwt
const headers = reactive({
  "Authorization": getJwt()
});

//导入教师
function importAll() {
  showImportDialog.value = true;
}

function onCloseImportDialog() {
  //TODO:
  // 作用是当关闭时重置状态
  // 使用resetFields时el-form需要ref和model，el-form-item需要prop
  // 正常使用时会警告，但表单内的destroy-on-close属性会正常生效，故暂时注释掉该代码
  // importFormRef.value.resetFields();
}

//上传成功后的回调
function onImportSuccess(resp) {
  if (resp.success) {
    ElMessage.success("导入成功，共导入" + resp.data + "行");
    showImportDialog.value = false;
    doSearch();
  } else {
    ElMessage.error(resp.msg || "导入失败");
  }
}

//upload实例
const uploadRef = ref();

//提交文件并上传
function submitImportExcel() {
  uploadRef.value.submit();
}

//头像文件上传成功之后的回调函数
function avatarUploadSuccess(resp) {
  if (resp.success) {
    teacherModel.value.avatar = resp.data;
  } else {
    ElMessage.error("头像上传失败");
  }
}

</script>