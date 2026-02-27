<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <div class="search-wrapper">
      <el-form :model="queryParams" ref="queryFormRef" inline>
        <el-form-item label="创建人" prop="createUser">
          <el-input v-model="queryParams.createUser" placeholder="请输入创建人" clearable @keyup.enter="handleQuery"/>
        </el-form-item>
        <el-form-item label="模版类型" prop="type">
          <el-select v-model="queryParams.type" placeholder="请选择模版类型" clearable>
            <el-option v-for="item in templateTypeOptions" :key="item.value" :label="item.label"
                       :value="item.value"/>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="请选择模版状态" clearable>
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label"
                       :value="item.value"/>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

    </div>
    <el-card class="box-card">
      <!-- 操作工具栏 -->
      <template #header>
        <el-button type="primary" plain icon="Plus" @click="handleAdd">新增
        </el-button>
        <el-button type="danger" plain icon="Delete" :disabled="selectedIds.length === 0"
                   @click="handleBatchDelete">批量删除
        </el-button>
      </template>

      <!-- 数据表格 -->
      <el-table v-loading="loading" :data="dataList" style="width: 100%"
                @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="35" heigth="355" align="center"/>
        <el-table-column label="模版类型" align="center" prop="type" width="150">
          <template #default="scope" >
            <el-tag v-if="scope.row.type" :type="'success'">
              {{ templateTypeOptions.find(item => item.value === scope.row.type)?.label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="主题" align="center" prop="subject" width="200" show-overflow-tooltip/>
        <el-table-column label="状态" align="center" prop="status" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 1" type="success">启用</el-tag>
            <el-tag v-else type="danger">禁用</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="正文" align="center" prop="content" width="150">
          <template #default="scope">
            <!-- 显示为链接 -->
            <a class="content-link" href="javascript:void(0);" @click="openPreviewDialog(scope.row.content, scope.row.subject)">
              点击预览正文
            </a>
          </template>
        </el-table-column>
        <el-table-column label="创建人" align="center" prop="createUser" width="100"/>
        <el-table-column label="创建时间" align="center" width="160" prop="createTime"/>
        <el-table-column label="更新时间" align="center" width="160" prop="updateTime"/>
        <el-table-column label="操作" align="center" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" link icon="Edit" @click="handleUpdate(scope.row)">修改
            </el-button>
            <el-button type="danger" link icon="Delete" @click="handleDelete(scope.row)">删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 正文预览部分 -->
      <el-dialog class="preview-content" v-model="previewContent.visible" :title="previewContent.subject" width="60%" center
                 :style="{ top: '-80px'}"
      >
        <!-- 分割线 -->
        <div v-html="previewContent.htmlContent"></div>
      </el-dialog>

      <!-- 分页工具栏 -->
      <div class="pagination-container">
        <el-pagination background v-model:current-page="queryParams.pageNum"
                       v-model:page-size="queryParams.pageSize" :page-sizes="[10, 20, 30, 50]" :total="total"
                       layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
                       @current-change="handleCurrentChange"/>
      </div>

      <!-- 添加或修改对话框 -->
      <el-dialog v-model="dialog.visible" :title="dialog.title" width="500px" append-to-body>
        <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
          <el-form-item label="模版类型" prop="type">
            <el-select v-model="form.type" placeholder="请选择模版类型" clearable>
              <el-option v-for="item in templateTypeOptions" :key="item.value" :label="item.label"
                         :value="item.value"/>
            </el-select>
          </el-form-item>
          <!-- 显示 param 值 -->
          <el-form-item v-if="form.type && getSelectedParams(form.type).length > 0" label="参数">
              <!-- 优化：首先找到对应的 selectedType -->
              <el-tag v-for="(param, index) in getSelectedParams(form.type)" :key="index" >
                <!-- 包裹 el-tag 的 el-tooltip 组件 -->
                <el-tooltip effect="light" :content="'注意：正文部分必须包含此参数, 且格式为{{' + param + '}}'" placement="top">
                  <span>{{ param }}</span>
                </el-tooltip>
              </el-tag>
          </el-form-item>
          <el-form-item label="主题" prop="subject">
            <el-input v-model="form.subject" placeholder="请输入邮件主题" clearable/>
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio v-for="(item) in statusOptions" :label="item.value">
                <el-tooltip class="item" effect="light" placement="top"
                            :content="getTooltipContent(item)">
                  <span>{{ item.label }}</span>
                </el-tooltip>
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="正文" prop="content">
            <el-input v-model="form.content" type="textarea" placeholder="请输入正文" :rows="10"/>
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button type="primary" @click="submitForm">确 定</el-button>
            <el-button @click="cancel">取 消</el-button>
          </div>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import {ElMessage, ElMessageBox} from 'element-plus'
import {
  listEmailTemplateApi,
  detailEmailTemplateApi,
  deleteEmailTemplateApi,
  addEmailTemplateApi,
  updateEmailTemplateApi,
  listEmailTemplateTypeApi
} from '@/api/email/template'

// 遮罩层
const loading = ref(true)
// 选中数组
const selectedIds = ref<any[]>([])
// 总条数
const total = ref(0)
// 表格数据
const dataList = ref([])
// 弹出层标题
// const title = ref('')
// 是否显示弹出层
// const open = ref(false)
// 弹窗控制
const dialog = reactive({
  title: '',
  visible: false,
  type: 'add'
})
// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  id: undefined,
  type: undefined,
  subject: undefined,
  content: undefined,
  status: undefined,
  createUser: undefined,
  createTime: undefined,
  updateTime: undefined,
  cc: undefined,
  attachment: undefined
})


const statusOptions = ref([
  {label: "启用", value: 1},
  {label: "禁用", value: 0},
]);

const templateTypeOptions = ref([]);
const previewContent = reactive({
  subject: '',
  visible: false,
  htmlContent: ''
})
// 表单参数
const form = reactive<any>({
  email: '',
  host: '',
  port: '',
  password: '',
  status: 0,
  remark: ''
})
// 表单校验
const rules = reactive({
  type: [
    {required: true, message: "模版类型不能为空", trigger: "blur"}
  ],
  subject: [
    {required: true, message: "主题不能为空", trigger: "blur"}
  ],
  content: [
    {required: true, message: "正文不能为空", trigger: "blur"},
    {
      validator: (rule, value, callback) => {
        const selectedParams = getSelectedParams(form.type);
        const formattedParams = selectedParams.map(param => `{{${param}}}`).join(', '); // 将每个 param 包裹在 {{}} 中
        if (!selectedParams.every(param => value.includes(`{{${param}}}`))) {
          callback(new Error(`正文必须包含以下所有内容：${formattedParams}`));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ]
})

const queryFormRef = ref()
const formRef = ref()

/** 查询列表 */
const getList = () => {
  loading.value = true
  listEmailTemplateApi(queryParams).then(response => {
    dataList.value = response.data.records
    total.value = response.data.total
    loading.value = false
  })
}
const getSelectedParams = (type: any) => {
  const selectedType = templateTypeOptions.value.find(item => item.value === type);
  //确返回的是数组，即使 params 不存在或为空
  return selectedType && Array.isArray(selectedType.params) && selectedType.params.length > 0 
    ? selectedType.params 
    : [];
}
// 打开弹窗并显示 HTML 内容
const openPreviewDialog = (content, subject) => {
  previewContent.htmlContent = content;
  previewContent.visible = true;
  previewContent.subject = subject;
}
/** 取消按钮 */
const cancel = () => {
  dialog.visible = false
  // // open.value = false
  reset()
}

/** 表单重置 */
const reset = () => {
  form.value = {
    id: undefined,
    type: undefined,
    subject: undefined,
    status: undefined,
    content: undefined,
  }
  formRef.value?.resetFields()
}


/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields()
  handleQuery()
}

/** 多选框选中数据 */
const handleSelectionChange = (selection: { id: any }[]) => {
  selectedIds.value = selection.map(item => item.id)
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset()
  dialog.visible = true
  dialog.title = "添加邮箱模版"
  dialog.type = "add"
}

/** 修改按钮操作 */
const handleUpdate = (row: any) => {
  reset()
  detailEmailTemplateApi(row.id).then(response => {
    Object.assign(form, response.data)
    dialog.visible = true
    dialog.title = "修改邮箱模版"
    dialog.type = "edit"
  })
}

/** 提交按钮 */
const submitForm = () => {
  formRef.value?.validate((valid: any) => {
    if (valid) {
      if (dialog.type === 'edit') {
        updateEmailTemplateApi(form).then(response => {
          ElMessage.success("修改成功")
          dialog.visible = false
          getList()
        })
      } else {
        addEmailTemplateApi(form).then(response => {
          ElMessage.success("新增成功")
          dialog.visible = false
          getList()
        })
      }
    }
  })
}

/** 批量删除按钮操作 */
const handleBatchDelete = () => {
  if (!selectedIds.value.length) {
    return
  }
  ElMessageBox.confirm('是否确认删除"' + selectedIds.value.length + '"条数据项?', "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    deleteEmailTemplateApi(selectedIds.value)
  }).then(() => {
    getList()
    ElMessage.success("删除成功")
  })
}

/** 删除按钮操作 */
const handleDelete = (row: any) => {
  ElMessageBox.confirm('是否确认删除主题为"' + row.subject + '"的数据项?', "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    deleteEmailTemplateApi(row.id)
  }).then(() => {
    getList()
    ElMessage.success("删除成功")
  })
}


// 添加分页方法
const handleSizeChange = (val: any) => {
  queryParams.pageSize = val
  getList()
}

const handleCurrentChange = (val: any) => {
  queryParams.pageNum = val
  getList()
}

const getTypes = async () => {
  try {
    const {data} = await listEmailTemplateTypeApi()
    templateTypeOptions.value = data
  } catch (error) {
  }
}

onMounted(() => {
  getList()
  getTypes()
})

// 切换密码的显示/隐藏状态
const togglePasswordVisibility = (row: any) => {
  row.passwordVisible = !row.passwordVisible;
}
// 将密码进行掩码处理，显示为 "**********"
const maskPassword = (password: any) => {
  return '*'.repeat(password.length);
}
// 悬停提示
const getTooltipContent = (item: any) => {
  if (item.value === 1) {
    return '注意若选择使用该配置，将停用同模版类型的其他配置';
  }
}
</script>


<style scoped>
/* 链接样式 */
.content-link {
  color: #409EFF;         /* 链接颜色 */
  text-decoration: underline;
}

/* preview-content 样式 */
.preview-content {
  padding: 2px;          /* 内边距 */
  font-size: 16px;        /* 字体大小 */
  color: #333;            /* 字体颜色 */
  line-height: 1;       /* 行高，增加可读性 */
  background-color: #f9f9f9; /* 背景色 */
  border-radius: 5px;     /* 圆角 */
  /*max-height: 50px;      !* 最大高度 *!*/
  /*overflow-y: auto;       !* 超出内容显示滚动条 *!*/
}

</style>
