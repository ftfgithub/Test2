<template>
  <div>
    <!-- 按钮 -->
    <el-button
      type="primary"
      icon="el-icon-plus"
      style="margin: 10px 0"
      @click="showDialog"
      >添加</el-button
    >
    <!-- 表格组件 -->
    <!-- data表格组件将来展示的数据----数组类型 
    border--边框
    column相关属性：
    label---显示的标题
    width---对应列的宽度
    align---标题对齐方式
    prop---对应列内容的字段
    注意1.elementUI当中的table，展示数据是一列一列进行展示
    -->
    <el-table style="width: 100%" border :data="list">
      <el-table-column type="index" label="序号" width="80" align="center">
      </el-table-column>
      <el-table-column prop="tmName" label="品牌名称" width="width">
      </el-table-column>
      <el-table-column prop="prop" label="品牌logo" width="width">
        <template slot-scope="{ row, $index }">
          <img :src="row.logoUrl" style="width: 100px; height: 100px" />
        </template>
      </el-table-column>
      <el-table-column prop="prop" label="操作" width="width">
        <template slot-scope="{ row, $index }">
          <el-button
            type="warning"
            icon="el-icon-edit"
            size="mini"
            @click="updateTradeMark(row)"
            >修改</el-button
          >
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteTradeMark(row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页器
    当前页
    当前第几页，数据总条数、每一页展示条数、连续页数
    current-pages:代表当前第几页
    total：代表分页器一共需要展示多少条
    page-size：代表每一页需要展示多少
    page-sizes：可以设置每一页展示多少条
    layout：可以实现分页器布局
     -->
    <el-pagination
      style="margin-top:20px';textAlign:center"
      :current-page="page"
      :total="total"
      :page-size="limit"
      :pager-count="7"
      :page-sizes="[3, 5, 10]"
      @current-change="getPageList"
      @size-change="handleSizeChange"
      layout="prev, pager, next, jumper,->,sizes, total"
    >
    </el-pagination>
    <!-- 对话框 
    :visible.sync 父子组件同步：控制对话框显示与隐藏
    form:組件提供表單驗證的功能，只需要通過rules屬性傳入約定的驗證規則，并將form-item的prop屬性設置為需要校验的
    Form 组件提供了表单验证的功能，只需要通过 rules 属性传入约定的验证规则，并将 Form-Item 的 prop 属性设置为需校验的字段名即可。
  -->
    <el-dialog :title="tmForm.id?'修改品牌':'添加品牌'" :visible.sync="dialogFormVisible">
      <!-- form表單 model属性 作用是把表单收集的数据收集到指定的对象，将来表单验证也需要这个-->
      <el-form style="width=80%" :model="tmForm" :rules="rules" ref="ruleForm">
        <el-form-item label="品牌名称" label-width="100px" prop='tmName'>
          <el-input autocomplete="off" v-model="tmForm.tmName"></el-input>
        </el-form-item>
        <!--  -->
        <el-form-item label="品牌logo" label-width="100px" prop="logoUrl">
           <!-- :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload" -->
            <!-- 上传图片收集数据 不能用v-model，因为不是表单元素
            action:设置图片上传的地址
            :on-success:可以检测图片上传成功，成功之后会执行
            :before-upload：上传图片之前执行一次
             -->
          <el-upload
            class="avatar-uploader"
            action="/dev-api/admin/product/fileUpload"
            :show-file-list="false"
             :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
            >
            <img v-if="tmForm.logoUrl" :src="tmForm.logoUrl" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
             <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addOrUpdateTradeMark()" 
          >确 定</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "tradeMark",
  data() {
    return {
      //   代表分页器第几页
      page: 1,
      // 当前展示数据条数
      limit: 3,
      // 总共数据条数
      total: 0,
      // 列表展示数据
      list: [],
      // 对话框显示与隐藏
      dialogFormVisible: false,
      // 收集品牌信息:对象身上的属性不能瞎写，看文档
      tmForm:{
        tmName:'',
        logoUrl:''
      },
      // 表单验证规则
      rules:{
        // 品牌名称
        // require:比需要校验的字段  message：提示信息  trigger：用户行为设置
        // min长度
         tmName: [
            { required: true, message: '请输入品牌名称', trigger: 'blur' },
            // 自定义校验规则
            { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'change' }
          ],
          //品牌logo
          logoUrl: [
            { required: true, message: '请选择图片'}
          ],
      }
    };
  },
  //   组件挂载完毕发请求
  mounted() {
    // 获取列表数据的函数
    this.getPageList();
  },
  methods: {
    // 获取品牌列表
    async getPageList(pager = 1) {
      this.page = pager;
      // 解构参数
      //  当你发请求的时候，需要带参数，因此在data中初始化两个字段，代表给服务器传的参数
      const { page, limit } = this;
      // 获取品牌列表接口
      let result = await this.$API.trademark.reqTradeMarkList(page, limit);
      if (result.code == 200) {
        // 分别是展示数据总条数与列表展示的数据
        this.total = result.data.total;
        this.list = result.data.records;
      }
    },
    // 当分页器某一页需要展示的数据条数发生改变时会触发
    handleSizeChange(limit) {
      // 整理参数
      this.limit = limit;
      this.getPageList();
    },
    // 显示对话框添加品牌
    showDialog() {
      this.dialogFormVisible = true;
         // 清除数据
    this.tmForm={ tmName:'',logoUrl:''}
    },
 
    // 修改品牌
    updateTradeMark(row) {
    //  row当前用户选中的商品的信息
      this.dialogFormVisible = true;
      // 将已有的品牌信息赋值给tmForm展示
      // 将服务器返回信息直接赋值给toForm进行展示
      // 也就是说，tmForm存储的就是服务器返回的信息
      this.tmForm ={...row}
    },
    // 上传图片回调函数
    // 上传成功
    handleAvatarSuccess(res, file) {
      // res上传成功之后返回给前端的数据，file上传成功之后，服务器返回给前端的数据
      // 手机品牌图片数据，将来需要带给服务器
        this.tmForm.logoUrl = res.data
      },
      // 图片上传之前
      beforeAvatarUpload(file) {
        const isJPG = file.type === 'image/jpeg';
        const isLt2M = file.size / 1024 / 1024 < 2;

        if (!isJPG) {
          this.$message.error('上传头像图片只能是 JPG 格式!');
        }
        if (!isLt2M) {
          this.$message.error('上传头像图片大小不能超过 2MB!');
        }
        return isJPG && isLt2M;
      },
      // 添加品牌或者修改品牌
        addOrUpdateTradeMark(){
      //  当全部验证字段通过，再去书写业务逻辑
        this.$refs.ruleForm.validate(async(success)=>{
          // 如果全部字段符合条件
          if(success){
             this.dialogFormVisible = false
        // 发请求(添加|修改)
      let result = await this.$API.trademark.reqAddOrUpdateTradeMark(this.tmForm)
      if(result.code == 200){
        // 彈出信息，添加品牌|修改成功
        this.$message({
          type:'success',
          message:this.tmForm.id?'修改品牌成功':'添加品牌成功'
        })
        // 如果添加成功停留第一页，修改成功停留在当前页
        // 成功之后需要再次获取品牌列表展示发请求
        this.getPageList(this.tmForm.id?this.page:1)
      }
          }else{
             console.log('error submit!!');
            return false;
          }
        })
      },
      // 删除品牌操作
      deleteTradeMark(row){
        // 弹框
        this.$confirm(`你确定删除${row.tmName}?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async() => {
          // 当用户点击确定按钮时触发
          // 向服务器发请求
         let result = await this.$API.trademark.reqDeleteTradeMark(row.id)
        //  如果删除成功
        if(result.code ==200){
           this.$message({
            type: 'success',
            message: '删除成功!'
          });
          // 再次获取品牌列表
          this.getPageList(
            this.list.length>1?this.page:this.page-1
          )
        }
         
        }).catch(() => {
          // 当用户点击取消按钮时触发
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });
      }
    
  },
};
</script>

<style>
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
</style>
