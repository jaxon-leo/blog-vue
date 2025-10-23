<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <div class="search-wrapper">
      <el-form :model="queryParams" ref="queryFormRef" inline>
        <el-form-item label="收件人" prop="toUser">
          <el-input v-model="queryParams.toUser" placeholder="请输入收件人" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="queryParams.type" placeholder="请选择模版类型" clearable>
            <el-option v-for="item in templateTypeOptions" :key="item.value" :label="item.label"  :value="item.value"/>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="请选择发送状态" clearable>
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value"/>
          </el-select>
        </el-form-item>
        <el-form-item label="模版邮件" prop="subject">
          <el-input v-model="queryParams.subject" placeholder="请输入邮件主题" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

    </div>
    <el-card class="box-card">
      <!-- 数据表格 -->
      <el-table v-loading="loading" :data="dataList" style="width: 100%"
                @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="35" heigth="355" align="center" />
        <el-table-column label="发件时间" align="center" prop="sendTime" width="150" />
        <el-table-column label="收件人" align="center" prop="toUser" width="150" />
        <el-table-column label="邮件主题" align="center" prop="subject" width="250" show-overflow-tooltip />
        <el-table-column label="模版类型" align="center" prop="type" width="100">
          <template #default="scope" >
            <el-tag v-if="scope.row.type" :type="'success'">
              {{ templateTypeOptions.find(item => item.value === scope.row.type)?.label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="邮件内容" align="center" prop="content" width="150">
          <template #default="scope">
            <!-- 显示为链接 -->
            <a class="content-link" href="javascript:void(0);" @click="openPreviewDialog(scope.row.content, scope.row.subject)">
              点击查看内容
            </a>
          </template>
        </el-table-column>

        <el-table-column label="发送状态" align="center" prop="status" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 1" type="success">成功</el-tag>
            <el-tag v-else type="danger">失败</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="备注" align="center" prop="remark" width="150" show-overflow-tooltip/>
        <el-table-column label="发件人" align="center" prop="fromUser" width="150" show-overflow-tooltip />
      </el-table>


      <!-- 分页工具栏 -->
      <div class="pagination-container">
        <el-pagination background v-model:current-page="queryParams.pageNum"
                       v-model:page-size="queryParams.pageSize" :page-sizes="[10, 20, 30, 50]" :total="total"
                       layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
                       @current-change="handleCurrentChange" />
      </div>


      <!-- 正文预览部分 -->
      <el-dialog class="preview-content" v-model="previewContent.visible" :title="previewContent.subject" width="60%" center
                 :style="{ top: '-80px'}"
      >
        <!-- 分割线 -->
        <div v-html="previewContent.htmlContent"></div>
      </el-dialog>


    </el-card>
  </div>
</template>

<script setup lang="ts">
import { listEmailSendRecordApi } from '@/api/email/record'
import {listEmailTemplateTypeApi} from "@/api/email/template";

// 遮罩层
const loading = ref(true)
// 选中数组
const selectedIds = ref<any[]>([])
// 总条数
const total = ref(0)
// 表格数据
const dataList = ref([])
const previewContent = reactive({
  subject: '',
  visible: false,
  htmlContent: ''
})
// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  id: undefined,
  subject: undefined,
  fromUser: undefined,
  toUser: undefined,
  type: undefined,
  content: undefined,
  sendTime: undefined,
  status: undefined,
  remark: undefined
})
const statusOptions = ref([
  {label: "成功", value: 1},
  {label: "失败", value: 0},
]);
const queryFormRef = ref()
const formRef = ref()
const templateTypeOptions = ref([]);

/** 查询列表 */
const getList = () => {
  loading.value = true
  listEmailSendRecordApi(queryParams).then(response => {
    dataList.value = response.data.records
    total.value = response.data.total
    loading.value = false
  })
}
const getTypes = async () => {
  try {
    const {data} = await listEmailTemplateTypeApi()
    templateTypeOptions.value = data
  } catch (error) {
  }
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

// 打开弹窗并显示 HTML 内容
const openPreviewDialog = (content, subject) => {
  previewContent.htmlContent = content;
  previewContent.visible = true;
  previewContent.subject = subject;
}


/** 多选框选中数据 */
const handleSelectionChange = (selection: { id: any }[]) => {
  selectedIds.value = selection.map(item => item.id)
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

onMounted(() => {
  getList()
  getTypes()
})
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
