<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-button type="primary" @click="addRoles">添加角色</el-button>
      <el-table :data="RolesInfo" border style="width: 100%">
        <el-table-column width="60" type="expand">
          <template slot-scope="info">
            <!-- 一级权限 -->
            <el-row
              v-for="(item,k) in info.row.children"
              :key="item.id"
              :style="{'border-bottom':'1px solid #EBEEF5', 'border-top': k===0 ? '1px solid #EBEEF5':''}"
            >
              <el-col :span="5">
                <el-tag closable @close="closeTag(info.row.id,item.id)">{{item.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <!-- 二级全线显示 -->
                <el-row
                  v-for="(item2,k2) in item.children"
                  :key="item2.id"
                  :style="{'border-top': k2!==0 ? '1px solid #EBEEF5':''}"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="closeTag(info.row.id,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!-- 三级权限 -->
                    <el-row>
                      <el-tag
                        closable
                        type="warning"
                        v-for="item3 in item2.children"
                        :key="item3.id"
                        @close="closeTag(info.row.id,item3.id)"
                      >{{item3.authName}}</el-tag>
                    </el-row>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作">
          <!-- 按钮 -->
          <template slot-scope="info">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editRoles(info.row.id)"
            >编辑</el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="delRoles(info.row.id)"
            >删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showDistributeDialog(info.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加用户信息 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClose">
      <el-form :rules="addFormRules" ref="addFormRef" :model="addForm" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUserRoles">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改弹框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClose">
      <el-form :rules="editFormRules" ref="editFormRef" :model="editForm" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserRoles">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="distributeDialogVisible" width="50%">
      <el-form :model="distributeForm" label-width="120px">
        <el-form-item label="当前的用户:">{{distributeForm.roleName}}</el-form-item>
        <el-form-item label="分配的权限:">
          <!-- :data="xxx"限定树中数据
          ：props="xxx"给大树设置数据属性，例如设置显示名称
          node-key="id"給每个树节点设置唯一属性，用户实际应用后期选择某个节点后也就会吧这个id值获取到
          show-checkbox// 显示复选框
          default-expand-all// 展开全部的树
          :default-checked-keys="deFaultCheckedKeys" //设定树节点默认选中情况
          -->
          <el-tree
            :data="rightsInfos"
            :props="rightsInfosProps"
            node-key="id"
            default-expand-all
            show-checkbox
            :default-checked-keys="deFaultCheckedKeys"
            ref="rightsRef"
          ></el-tree>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="distributeDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="distributeRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created() {
    this.getRolesInfo()
  },
  methods: {
    // 分配权限相关信息
    async distributeRights() {
      // 把全选节点的id信息获得到，数组返回
      var ids1 = this.$refs.rightsRef.getCheckedKeys()
      // 把半选节点的id信息获取到，数组返回
      var ids2 = this.$refs.rightsRef.getHalfCheckedKeys()
      // 把全选和半选的权限id合并到一起通过逗号链接变为字符串
      var allids = [...ids1, ...ids2].join(',')
      const { data: res } = await this.$http.post(
        'roles/' + this.distributeForm.id + '/rights',
        { rids: allids }
      )
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      //  成功关闭弹框  提示信息 刷新数据
      this.distributeDialogVisible = false
      this.$message.success(res.meta.msg)
      this.getRolesInfo()
    },
    // 分配权限相关信息
    // role:被分配权限的所有id
    async showDistributeDialog(role) {
      this.distributeDialogVisible = true
      this.distributeForm = role
      // 把大树tree需要的权限获得出来
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error(this.meta.msg)
      }
      //  把获取的值赋予给rightInfos
      this.rightsInfos = res.data
      var arrIds = []
      this.getHaveRights(role, arrIds)
      // 把获取好的arrids赋予给deFaultCheckedKeys
      this.deFaultCheckedKeys = arrIds
    },
    // 通过递归的方式把一个角色的对应末级权限的id显示出来
    getHaveRights(node, keys) {
      if (!node.children) {
        return keys.push(node.id)
      }
      node.children.forEach(item => {
        return this.getHaveRights(item, keys)
      })
    },
    // 删除信息
    closeTag(roleId, rightsId) {
      this.$confirm('确认删除该权限么？', '删除权限', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          const { data: res } = await this.$http.delete(
            'roles/' + roleId + '/rights/' + rightsId
          )
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg)
          }
          // 提示删除成功 重新加载
          this.$message.success(res.meta.msg)
          this.getRolesInfo()
        })
        .catch(() => {})
    },
    // 修改重置表单
    editDialogClose() {
      this.$refs.editFormRef.resetFields()
    },
    // 删除用户
    delRoles(id) {
      this.$confirm('确定要删除此用户么?', '删除用户', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          // axios调用api删除用户
          const { data: res } = await this.$http.delete('roles/' + id)
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg)
          }
          // 成功提示 显示删除成功 刷新页面
          this.$message.success(res.meta.msg)
          this.getRolesInfo()
        })
        .catch(() => {})
    },
    // 修改用户信息
    async editUserRoles() {
      this.$refs.editFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.put(
            'roles/' + this.editForm.roleId,
            this.editForm
          )
          // 修改失败
          if (res.meta.status !== 200) {
            return this.$message.error(this.meta.msg)
          }
          // 修改成功  关闭模态框 刷新页面 提示成功
          this.editDialogVisible = false
          this.$message.success(res.meta.msg)
          this.getRolesInfo()
        }
      })
    },
    // 弹出修改框
    async editRoles(id) {
      this.editDialogVisible = true
      const { data: res } = await this.$http.get('roles/' + id)
      // 吧获取到的数据提交给表单
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.editForm = res.data
    },
    // 关闭弹框重置表单
    addDialogClose() {
      // resetFields()重置方法
      this.$refs.addFormRef.resetFields()
    },
    // 点击显示模态框
    addRoles() {
      this.addDialogVisible = true
    },
    // 查询页面相关信息
    async getRolesInfo() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.RolesInfo = res.data
    },
    // 添加相关操作
    async addUserRoles() {
      this.$refs.addFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.post('roles', this.addForm)

          // 添加失败
          if (res.meta.status !== 201) {
            return this.$message.error(res.meta.msg)
          }
          // 成功显示信息  关闭弹框 提示成功
          this.addDialogVisible = false
          this.$message.success(res.meta.msg)
          this.getRolesInfo()
        }
      })
    }
  },
  data() {
    return {
      deFaultCheckedKeys: [], // 默认收集权限id
      rightsInfosProps: {
        label: 'authName', // 设置属性名称
        children: 'children' // 设置子树的属性名称
      }, // 给大树设定属性字段
      rightsInfos: [], // 接收被分配的权限列表
      distributeForm: {
        id: 0, // 被分配角色的id信息
        roleName: '' // 被分配权限的角色名称信息
      },
      // 分配权限框
      distributeDialogVisible: false,
      // 修改弹框
      editDialogVisible: false,
      // from表单相关数据
      editForm: {
        roleName: '',
        roleDesc: '',
        roleId: ''
      },
      // 接收信息
      RolesInfo: [],
      // 设置修改打开模态框
      addDialogVisible: false,
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      // 验证表单信息
      addFormRules: {
        roleName: [{ required: true, message: '角色名称必填', trigger: 'blur' }]
      },
      editFormRules: {
        roleName: [{ required: true, message: '角色名称必填', trigger: 'blur' }]
      }
    }
  }
}
</script>

<style lang="less" scoped>
.el-table {
  margin-top: 15px;
}
.el-tag {
  margin: 10px 5px;
}
.el-row {
  display: flex;
  align-items: center;
}
</style>
