<template>
  <div>
    <el-card style="margin: 20px 0">
      <CategorySelect @getCategoryId="getCategoryId" :show='!isShowTable'></CategorySelect>
    </el-card>
    <el-card>
      <div v-show="isShowTable">
        <el-button
          type="primary"
          icon="el-icon-plus"
          :disabled="!category3Id"
          @click="addAttr"
          >添加属性</el-button
        >
        <!-- 表格：展示平台属性 -->
        <el-table style="width: 100%" border :data="attrList">
          <el-table-column align="center" type="index" label="序号" width="80">
          </el-table-column>
          <el-table-column prop="prop" label="属性名称" width="150">
          </el-table-column>
          <el-table-column header-align="center" prop="prop" label="属性值列表">
            <template slot-scope="{ row, $index }">
              <el-tag
                type="success"
                v-for="(attrValue, index) in row.attrValueList"
                :key="attrValue.id"
                style="margin: 0 10px"
                >{{ attrValue.valueName }}</el-tag
              >
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="150">
            <template slot-scope="{ row, $index }">
              <el-button
                type="warning"
                icon="el-icon-edit"
                size="mini"
                @click="updateAttr(row)"
              ></el-button>
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
              ></el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- 添加属性修改属性的结构 -->
      <div v-show="!isShowTable">
        <el-form :inline="true" ref="form" label-width="80px" :model="attrInfo">
          <el-form-item label="属性名">
            <el-input
              placeholder="请输入属性名"
              v-model="attrInfo.attrName"
            ></el-input>
          </el-form-item>
        </el-form>
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="addAttrValue"
          :disabled="!attrInfo.attrName"
          >添加属性值</el-button
        >
        <el-button @click="isShowTable = true">取消</el-button>
        <el-table
          border
          style="width: 100%; margin: 20px 0"
          :data="attrInfo.attrValueList"
        >
          <el-table-column align="center" type="index" label="序号" width="80">
          </el-table-column>
          <el-table-column
            prop="prop"
            type="index"
            label="属性值名称"
            width="800"
          >
            <template slot-scope="{ row, $index }">
              <!-- 这里结构需要用到span和input来回切换 -->
              <el-input
                v-model="row.valueName"
                placeholder="请输入属性值名称"
                size="mini"
              ></el-input>
              <!-- <span>{{row.valueName}}</span> -->
            </template>
          </el-table-column>
          <el-table-column prop="prop" type="index" label="操作" width="150">
            <template slot-scope="{ row, $index }">
              <!-- 旗袍确认框 -->
              <el-popconfirm :title="`确定删除${row.valueName}吗？`" @onConfirm='deleteAttrValue($index)'>
                <el-button
                type="primary"
                icon="el-icon-delete"
                size="mini"
                slot="reference"
              ></el-button>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <el-button type="primary" @click="AddOrUpdateAttr" :disabled="attrInfo.attrValueList.length<1">保存</el-button>
        <el-button type="primary" @click="isShowTable = true">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
// 按需引入lodash的深拷贝
import cloneDeep from "lodash/cloneDeep";
export default {
  name: "attr",
  data() {
    return {
      category1Id: "",
      category2Id: "",
      category3Id: "",
      // 接收平台属性字段
      attrList: [],
      // 控制table现实与隐藏
      isShowTable: true,
      // 收集新增属性|修改属性使用的
      attrInfo: {
        attrName: "", //属性名
        attrValueList: [
          //属性值，因为属性值可以有多个因此用数组，每一个属性值都是一个对象需要attrId，valueName
        ],
        categoryId: 0, //三级分类的id
        categoryLevel: 3, //因为服务器也需要区分几级id
      },
    };
  },
  methods: {
    // 自定义事件回调
    getCategoryId({ categoryId, level }) {
      // 区分三级分类相应的id以及父组件进行存储
      if (level == 1) {
        this.category1Id = categoryId;
        this.category2Id = "";
        this.category3Id = "";
      } else if (level == 2) {
        this.category2Id = categoryId;
        this.category3Id = "";
      } else {
        // 代表三级分类id有了
        this.category3Id = categoryId;
        // 发请求获取品牌属性
        this.getAttrList();
      }
    },
    // 发请求获取平台属性
    async getAttrList() {
      const { category1Id, category2Id, category3Id } = this;
      let result = await this.$API.attr.reqAttrList(
        category1Id,
        category2Id,
        category3Id
      );
      if (result.code == 200) {
        this.attrList = result.data;
      }
    },
    // 添加属性值回调
    addAttrValue() {
      // 项属性值数组里面添加元素
      this.attrInfo.attrValueList.push({
        // attrId是相应属性的id，目前我们是添加属性的操作，还没有相应的属性id
        // valueName相应的属性值名称
        attrId: this.attrInfo.id, //对于修改某一个产品时，可以在已有的属性之上新增新的属性值（新增属性值的时候，需要把已有的属性id带上）
        valueName: "",
      });
    },
    // 添加属性按钮回调
    addAttr() {
      //切换table显示与隐藏
      this.isShowTable = false;
      //清除数据
      //收集三级分类的id
      this.attrInfo = {
        attrName: "", //属性名
        attrValueList: [
          //属性值，因为属性值可以有多个因此用数组，每一个属性值都是一个对象需要attrId，valueName
        ],
        categoryId: this.category3Id, //三级分类的id
        categoryLevel: 3, //因为服务器也需要区分几级id
      };
    },
    // 修改一个属性
    updateAttr(row) {
      // isShowTable变为false
      this.isShowTable = false;
      // 将选中的属性赋值给attrInfo
      // 由于数据结构当中
      // 存在对象里面套数组，数组里面套对象，因此需要深拷贝
      this.attrInfo = cloneDeep(row);
    },
    // 气泡确认框确定按钮回调
    deleteAttrValue(index){
      // 当前不需要发请求
      this.attrInfo.attrValueList.splice(index,1)
    },
    // 保存按钮
    async AddOrUpdateAttr(){
    //  整理参数：如果用户添加很多属性且都是空的，不应该提交给服务器
    // 提交字段不应该包含flag
    this.attrInfo.attrValueList= this.attrInfo.attrValueList.filter(item=>{
      // 过滤掉属性值不是空的
      if(item.valueName !=''){
        // 删除flag属性
        delete item.flag
        return true
      }
    })
    // 发请求
    try {
    await this.$API.attr.reqAddOrUpdateAttr(this.attrInfo)
    // 展示平台属性信号量进行切换
    this.isShowTable = true
    // 提示消息
    this.$message({type:'success',message:'保存成功'})
    // 保存成功以后，需要再次获取平台属性进行展示
    this.getAttrList()
    } catch (error) {
        this.$message('保存失败')
    }
    }
  },
};
</script>

<style>
</style>