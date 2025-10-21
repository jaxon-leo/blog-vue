<template>
    <div class="app-container">
        <!-- 搜索表单 -->
        <div class="search-wrapper">
            <el-form :model="queryParams" ref="queryFormRef" inline>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="queryParams.email" placeholder="请输入邮箱" clearable @keyup.enter="handleQuery" />
                </el-form-item>
                <el-form-item label="备注" prop="remark">
                    <el-input v-model="queryParams.remark" placeholder="请输入备注" clearable @keyup.enter="handleQuery" />
                </el-form-item>
                <el-form-item label="状态" prop="status">
                    <el-select v-model="queryParams.status" placeholder="请选择邮箱状态" clearable>
                        <el-option v-for="item in typeOptions" :key="item.value" :label="item.label"
                            :value="item.value" />
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
                <el-table-column type="selection" width="35" heigth="355" align="center" />
                <el-table-column label="邮箱" align="center" prop="email" width="200" show-overflow-tooltip />
                <el-table-column label="host" align="center" prop="host" width="200" show-overflow-tooltip />
                <el-table-column label="端口" align="center" prop="port" width="60" />
                <el-table-column label="状态" align="center" prop="status" width="100">
                    <template #default="scope">
                        <el-tag v-if="scope.row.status === 1" type="success">启用</el-tag>
                        <el-tag v-else type="danger">禁用</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="备注" align="center" prop="remark" width="150" show-overflow-tooltip />
                <el-table-column label="创建时间" align="center" width="150" prop="createTime" />
                <el-table-column label="更新时间" align="center" width="150" prop="updateTime" />
                <el-table-column label="密码" align="center" width="150" prop="password" show-overflow-tooltip />
                <el-table-column label="操作" align="center" width="200" fixed="right">
                    <template #default="scope">
                        <el-button type="primary" link icon="Edit" @click="handleUpdate(scope.row)">修改
                        </el-button>
                        <el-button type="danger" link icon="Delete" @click="handleDelete(scope.row)">删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页工具栏 -->
            <div class="pagination-container">
                <el-pagination background v-model:current-page="queryParams.pageNum"
                    v-model:page-size="queryParams.pageSize" :page-sizes="[10, 20, 30, 50]" :total="total"
                    layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
                    @current-change="handleCurrentChange" />
            </div>

            <!-- 添加或修改对话框 -->
            <el-dialog v-model="dialog.visible" :title="dialog.title" width="500px" append-to-body>
                <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
                    <el-form-item label="邮箱" prop="email">
                        <el-input v-model="form.email" placeholder="请输入邮箱" clearable />
                    </el-form-item>
                    <el-form-item label="host" prop="host">
                        <el-input v-model="form.host" placeholder="请输入host" clearable />
                    </el-form-item>
                    <el-form-item label="端口" prop="port">
                        <el-input v-model="form.port" placeholder="请输入端口" clearable />
                    </el-form-item>
                    <el-form-item label="密码" prop="password">
                        <el-input v-model="form.password" placeholder="请输入密码" clearable />
                    </el-form-item>
                    <el-form-item label="立即使用" prop="status">
                        <el-radio-group v-model="form.status">
                            <el-radio v-for="(item) in typeOptions" :label="item.value">
                                <el-tooltip class="item" effect="light" placement="top"
                                    :content="getTooltipContent(item)">
                                    <span>{{ item.label }}</span>
                                </el-tooltip>
                            </el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="备注" prop="remark">
                        <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
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
import { ElMessage, ElMessageBox } from 'element-plus'
import {
    listEmailConfigApi,
    detailEmailConfigApi,
    deleteEmailConfigApi,
    addEmailConfigApi,
    updateEmailConfigApi
} from '@/api/email/config'

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
    email: undefined,
    host: undefined,
    port: undefined,
    password: undefined,
    status: undefined,
    createTime: undefined,
    updateTime: undefined,
    remark: undefined,
})


const typeOptions = ref([
    { label: "启用", value: 1 },
    { label: "禁用", value: 0 },
]);

// const typeOptionsDialogue = ref([
//     { label: "是", value: 1 },
//     { label: "否", value: 0 }
// ]);

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
    email: [
        { required: true, message: "邮箱不能为空", trigger: "blur" }
    ],
    host: [
        { required: true, message: "host不能为空", trigger: "blur" }
    ],
    port: [
        { required: true, message: "端口不能为空", trigger: "blur" },
        { pattern: /^[0-9]{1,5}$/, message: '端口格式错误', trigger: 'blur' }
    ],
    password: [
        { required: true, message: "密码不能为空", trigger: "blur" }
    ]
})

const queryFormRef = ref()
const formRef = ref()

/** 查询列表 */
const getList = () => {
    loading.value = true
    listEmailConfigApi(queryParams).then(response => {
        dataList.value = response.data.records
        total.value = response.data.total
        loading.value = false
    })
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
        email: undefined,
        host: undefined,
        port: undefined,
        password: undefined,
        status: undefined,
        createTime: undefined,
        updateTime: undefined,
        remark: undefined
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
    dialog.title = "添加邮箱配置"
    dialog.type = "add"
}

/** 修改按钮操作 */
const handleUpdate = (row: any) => {
    reset()
    detailEmailConfigApi(row.id).then(response => {
        Object.assign(form, response.data)
        dialog.visible = true
        dialog.title = "修改邮箱配置"
        dialog.type = "edit"
    })
}

/** 提交按钮 */
const submitForm = () => {
    formRef.value?.validate((valid: any) => {
        if (valid) {
            if (dialog.type === 'edit') {
                updateEmailConfigApi(form).then(response => {
                    ElMessage.success("修改成功")
                    dialog.visible = false
                    getList()
                })
            } else {
                addEmailConfigApi(form).then(response => {
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
        deleteEmailConfigApi(selectedIds.value)
    }).then(() => {
        getList()
        ElMessage.success("删除成功")
    })
}

/** 删除按钮操作 */
const handleDelete = (row: any) => {
    ElMessageBox.confirm('是否确认删除邮箱为"' + row.email + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
    }).then(() => {
        deleteEmailConfigApi(row.id)
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

onMounted(() => {
    getList()
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
        return '若选择使用该配置，将停用其他配置';
    }
}
</script>
