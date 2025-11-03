<template>
  <div>
    <!-- 上传资源对话框 -->
    <el-dialog
      title="上传资源"
      :visible.sync="dialogVisible"
      width="500px"
      custom-class="upload-dialog"
      @close="handleClose"
    >
      <el-form
        ref="uploadForm"
        :model="uploadForm"
        :rules="uploadRules"
        label-width="80px"
      >
        <el-form-item label="资源名称" prop="name">
          <el-input v-model="uploadForm.name" placeholder="请输入资源名称" />
        </el-form-item>

        <el-form-item label="资源分类" prop="category">
          <el-select v-model="uploadForm.category" placeholder="请选择分类">
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.label"
              :value="category.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="资源描述" prop="description">
          <el-input v-model="uploadForm.description" type="text" placeholder="请输入资源描述" />
        </el-form-item>

        <el-form-item label="资源类型" prop="type">
          <el-radio-group v-model="uploadForm.type">
            <el-radio :label="0">下载链接</el-radio>
            <el-radio :label="1">网盘地址</el-radio>
            <el-radio :label="2">本地</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 根据 type 的值动态渲染不同的内容 -->
        <div v-if="uploadForm.type === 2" aria-hidden="true">
          <!-- 本地类型，显示带+号的文件上传框 -->
          <el-form-item label="" prop="localFile">
            <el-upload
                action=""
                :http-request="uploadFile"
                :before-upload="beforeFileUpload"
                :show-file-list="false"
                :on-change="handleFileChange"
                :on-success="handleUploadSuccess"
                :accept="''"
            >
            <el-button size="small" type="primary" icon="el-icon-plus">点击上传本地文件</el-button>
            </el-upload>
          </el-form-item>

          <!-- 显示上传文件列表 -->
          <el-form-item v-if="uploadedFiles.length > 0" label="">
            <el-tag
                v-for="(file, index) in uploadedFiles"
                :key="index"
                closable
                @close="removeFile(index)"
            >
              {{ file.name }}
            </el-tag>
          </el-form-item>
        </div>

        <div v-if="uploadForm.type === 0" aria-hidden="true">
          <!-- 下载链接，不显示网盘地址和提取码 -->
          <el-form-item label="下载链接" prop="link">
            <el-input v-model="uploadForm.link" placeholder="请输入下载链接" />
          </el-form-item>
        </div>

        <div v-if="uploadForm.type === 1" aria-hidden="true">
          <!-- 网盘地址，显示网盘地址和提取码 -->
          <el-form-item label="网盘地址" prop="link">
            <el-input v-model="uploadForm.link" placeholder="请输入网盘地址" />
          </el-form-item>

          <el-form-item label="提取码" prop="panCode">
            <el-input v-model="uploadForm.panCode" placeholder="请输入提取码" />
          </el-form-item>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="submitUpload" :loading="uploading">
          确 定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { addResourceApi } from '@/api/resources';
import {uploadFileApi} from '@/api/file';


export default {
  name: "AddResource",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    categories: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      uploading: false,
      uploadForm: {
        name: '',
        category: '',
        type: 0,
        link: '',
        panCode: '',
        description: ''
      },
      uploadedFiles: [],  // 用于保存上传成功的文件列表
      uploadRules: {
        name: [
          { required: true, message: '请输入资源名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        category: [
          { required: true, message: '请选择资源分类', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择资源类型', trigger: 'change' }
        ],
        link: [
          { required: true, message: '请输入正确链接', trigger: 'blur' }
        ]
      }
    };
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible;
      },
      set(value) {
        this.$emit('update:visible', value);
      }
    }
  },
  methods: {

    /**
     * 重置表单
    **/
    resetForm(){
      this.uploadForm = {
        name: '',
        category: '',
        type: 0,
        link: '',
        panCode: '',
        description: ''
      }
    },
    /**
     * 关闭对话框
    **/
    handleClose() {
      this.dialogVisible = false;
      this.resetForm();
      this.uploadedFiles = [];
    },
    /**
     * 提交上传
     **/
    submitUpload() {
      //本地上传额外验证
      if (this.uploadForm.type === 2 && !this.uploadForm.link) {
        this.$message.error("请上传本地文件");
        return;
      }

      this.$refs.uploadForm.validate((valid) => {
        if (valid) {
          addResourceApi(this.uploadForm).then(res => {
            this.$message.success("资源上传成功！");
            console.log(this.uploadForm)
            // 重置表单
            this.handleClose();
            this.resetForm();
            //刷新
            window.location.reload();
          })
        }
      });
    },

    /**
     * 上传文件
     **/
    uploadFile({ file, onSuccess, onError }){
      if(this.uploadedFiles.length > 0) {
        this.$message.error("若有多个文件, 请打包上传")
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      uploadFileApi(formData, 'resource').then((res) => {
        this.uploadForm.link = res.data
        onSuccess(res.data)
        console.log("上传成功", res.data)
      });
    },

    /**
     * 允许在文件上传前执行的钩子方法（可以用来做文件类型、大小验证等）
     **/
    beforeFileUpload(file){
      const MAX_SIZE = 5 * 1024 * 1024; // 2MB 大小限制
      if (file.size > MAX_SIZE) {
        this.$message.error('文件大小超过5MB！请选择下载链接/网盘地址的上传类型');
        return false; // 阻止上传
      }
      return true; // 允许上传
    },

    // 上传成功的回调函数
    handleUploadSuccess(response, file, fileList) {
      this.uploadedFiles.push({
        name: file.name,
        url: response
      })
    },
    /**
     * 文件选择变化时触发的事件方法
     **/
    handleFileChange() {
      // this.$message.success("文件选择变化时触发的事件方法")
    },

    // 删除文件
    removeFile(index) {
      this.uploadedFiles.splice(index, 1);
      //TODO 调用文件删除接口
    }
  },
};
</script>

<style scoped lang="scss">

</style>
