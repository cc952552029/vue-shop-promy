<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="10">
          <!-- native 激活原始的内部html标签特性  -->
          <el-input
            placeholder="请输入搜索内容"
            v-model="querycdt.query"
            :clearable="true"
            @clear="getUserInfos"
            @keyup.enter.native="getUserInfos"
          >
            <el-button slot="append" icon="el-icon-search" @click="getUserInfos"></el-button>
          </el-input>
        </el-col>
        <el-col :span="8">
          <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 表格数据 -->
      <el-table :data="userInfos" border style="width: 100%">
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column prop="username" label="用户名"></el-table-column>
        <el-table-column prop="mobile" label="手机号码" width="110"></el-table-column>
        <el-table-column prop="role_name" label="角色" width="120"></el-table-column>
        <el-table-column prop="email" label="邮箱" width="160"></el-table-column>
        <el-table-column prop="mg_state" label="状态" width="70">
          <!-- 状态插槽填充 slot-scope作用域插槽传递 <slot row="每个用户的数据对象"></slot>
          获取用户的具体信息<span slot-scope="info">{{info.row.xxx}}</span>-->
          <el-switch
            v-model="info.row.mg_state"
            slot-scope="info"
            @change="changeState(info.row.id,info.row.mg_state)"
          ></el-switch>
        </el-table-column>
        <el-table-column label="操作" width="230">
          <template slot-scope="info">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(info.row.id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="delUser(info.row.id)"
            ></el-button>
            <el-tooltip content="分配角色" placement="top" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="showFenpeiDialog(info.row.id)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- @size-change="handleSizeChange" 每页信息条数变化的回调处理-->
      <!-- @current-change="handleCurrentChange" 当前页码回调的处理 -->
      <!-- :current-page="currentPage4" 当前默认页码 -->
      <!-- :page-size="100" 默认每页记录条数-->
      <!-- :total="400" 可以通过总条数算出总页数-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querycdt.pagenum"
        :page-sizes="[3, 5, 10, 20]"
        :page-size="querycdt.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="querycdt.tot"
      ></el-pagination>
      <!-- 添加用户对话框 -->
      <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClose">
        <el-form :rules="addFormRules" ref="addFormRef" :model="addForm" label-width="80px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号码" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改用户对话框 -->
      <el-dialog
        title="修改用户"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClose"
      >
        <el-form :rules="editFormRules" ref="editFormRef" :model="editForm" label-width="80px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="editForm.username" :disabled="true"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号码" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editUser">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 分配角色对话框 -->
      <el-dialog
        title="分配角色"
        :visible.sync="fenpeiDialogVisible"
        width="50%"
        @close="fenpeiDialogClose"
      >
        <el-form
          :rules="fenpeiFormRules"
          ref="fenpeiFormRef"
          :model="fenpeiForm"
          label-width="120px"
        >
          <el-form-item label="当前的用户:" prop="username">{{fenpeiForm.username}}</el-form-item>
          <el-form-item label="分配的角色:" prop="rid">
            <el-select v-model="fenpeiForm.rid" placeholder="请选择">
              <el-option
                v-for="item in roleInfos"
                :key="item.id"
                :label="item.roleName"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="fenpeiDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="fenpeiUser">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  // 生命周期函数调用
  created() {
    this.getUserInfos()
  },
  methods: {
    // 展开分配角色对话框
    async showFenpeiDialog(id) {
      // id 被分配角色的目标id，
      // 展开对话框
      this.fenpeiDialogVisible = true
      //  根据角色查询id
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.fenpeiForm = res.data

      if (this.fenpeiForm.rid === 0) {
        this.fenpeiForm.rid = ''
      }
      // 把共分配的角色信息获得出来
      const { data: res2 } = await this.$http.get('roles')
      if (res2.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.roleInfos = res2.data
    },
    // 收集数据存储
    fenpeiUser() {
      // 表单校验
      this.$refs.fenpeiFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.put(
            'users/' + this.fenpeiForm.id + '/role',
            this.fenpeiForm
          )
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg)
          }
          // 分配角色成功  数据重新加载 关闭弹框 提示成功
          this.$message.success(res.meta.msg)
          this.fenpeiDialogVisible = false
          this.getUserInfos()
        }
      })
    },
    // 分配角色重置表单
    fenpeiDialogClose() {
      this.$refs.editFormRef.resetFields()
    },
    //  修改重置表单
    editDialogClose() {
      this.$refs.editFormRef.resetFields()
    },

    // 修改用户相关
    editUser() {
      // 表单检验
      this.$refs.editFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.put(
            'users/' + this.editForm.id,
            this.editForm
          )
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg)
          }
          // 修改成功 关闭对话框 提示成功 刷新页面
          this.editDialogVisible = false
          this.$message.success(res.meta.msg)
          this.getUserInfos()
        }
      })
    },
    // 修改用户的对话框显示
    async showEditDialog(id) {
      this.editDialogVisible = true
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      // 获取成功吧信息赋予给表单对象
      this.editForm = res.data
    },
    // 删除数据id被删除数据id
    delUser(id) {
      this.$confirm('确认删除该用户?', '删除用户？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          //  axios调用api删除用户
          const { data: res } = await this.$http.delete('users/' + id)
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg)
          }

          // 删除成功时候的提示 刷新数据 消息提示
          this.$message.success(res.meta.msg)
          if (this.userInfos.length === 1 && this.querycdt.pagenum > 1) {
            this.querycdt.pagenum--
          }
          this.getUserInfos()
        })
        .catch(() => {})
    },
    // 收集数据存储入库
    addUser() {
      // 需要先校验from表单
      this.$refs.addFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.post('users', this.addForm)
          // 添加失败弹框
          if (res.meta.status !== 201) {
            return this.$message.error(res.meta.msg)
          }
          // 成功提示 显示新数据 关闭对话框
          this.addDialogVisible = false
          this.$message.success(res.meta.msg)
          this.getUserInfos()
        }
      })
    },

    // 对话框关闭回调
    addDialogClose() {
      // resetFields()重置方法
      this.$refs.addFormRef.resetFields()
    },
    async changeState(uid, state) {
      // uid:被修改的id
      // state:被修改的用户信息
      const { data: res } = await this.$http.put(
        '/users/' + uid + '/state/' + state
      )
      if (res.meta.status !== 200) {
        // 修改失败的提示
        return this.$message.error(res.meta.msg)
      }
      // 修改成功的提示
      this.$message.success(res.meta.msg)
    },
    // 数据相关分页1
    // 每条记录条数变化
    handleSizeChange(arg) {
      // arg:变化后的记录条数
      this.querycdt.pagesize = arg
      this.getUserInfos()
    },

    // 数据相关2
    // 当前页码变化的回调处理
    handleCurrentChange(arg) {
      // arg:变化后的当前页码值
      this.querycdt.pagenum = arg
      // 重新获取页面数据
      this.getUserInfos()
    },
    // 显示真实的数据
    async getUserInfos() {
      //  this.$http.get('users',条数/页码/关键字)
      // 动态路由匹配
      const { data: res } = await this.$http.get('/users', {
        params: this.querycdt
      })
      // console.log(res)
      // 判断请求是否成功
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      // 获取总记录条数
      this.querycdt.tot = res.data.total
      // 把获得好的用户数据赋予给 userInfos
      this.userInfos = res.data.users
    }
  },
  data() {
    //  var checkAge = (rule, value被校验数据, callback回调方法) => {}
    var checkAge = (rule, value, callback) => {
      // 正则表达式检验
      if (!/^1[35789]\d{9}$/.test(value)) {
        return callback(new Error('手机号码验证不正确'))
      }
      callback()
    }
    // 邮箱验证
    var checkEmail = (rule, value, callback) => {
      if (
        !/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/.test(
          value
        )
      ) {
        return callback(new Error('邮箱验证不正确'))
      }
      callback()
    }

    return {
      // 表单数据
      fenpeiForm: {
        id: 0, // 当前被修该的id
        username: '',
        rid: 0 // 角色id
      },
      // 分配用户规则校验
      fenpeiFormRules: {
        rid: [{ required: true, message: '角色必选', trigger: 'change' }]
      },
      // 分配角色显示开关
      fenpeiDialogVisible: false,
      // 修改用户相关信息
      editDialogVisible: false,
      // from表单相关数据
      editForm: {
        username: '',
        email: '',
        mobile: ''
      },
      // 表单校验相关信息
      editFormRules: {
        mobile: [
          { required: true, message: '手机号必填', trigger: 'blur' },
          // 自定义校验规则
          // { validator: 检验函数, trigger: 'blur' }
          { validator: checkAge, trigger: 'blur' }
        ],
        email: [
          // 自定义校验规则
          // { validator: 检验函数, trigger: 'blur' }
          { validator: checkEmail, trigger: 'blur' }
        ]
      },

      // 添加用户相关数据控制模态框显示隐藏
      addDialogVisible: false,
      // from表单相关数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 表单校验相关信息
      addFormRules: {
        username: [{ required: true, message: '用户名必填', trigger: 'blur' }],
        password: [{ required: true, message: '密码必填', trigger: 'blur' }],
        mobile: [
          { required: true, message: '手机号必填', trigger: 'blur' },
          // 自定义校验规则
          // { validator: 检验函数, trigger: 'blur' }
          { validator: checkAge, trigger: 'blur' }
        ],
        email: [
          // 自定义校验规则
          // { validator: 检验函数, trigger: 'blur' }
          { validator: checkEmail, trigger: 'blur' }
        ]
      },
      // 用户关键字
      userInfos: [],
      // 给获取获取用户数据设置查询条件
      querycdt: {
        // 查询关键字
        query: '',
        //  当前页码
        pagenum: 1,
        // 每页获取记录条数
        pagesize: 3,
        // 总记录条数
        tot: 0
      }
    }
  }
}
</script>

<style lang="less" scoped>
.el-table {
  margin-top: 15px;
  font-size: 12px;
}
</style>
