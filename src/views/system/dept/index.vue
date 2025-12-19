<template>
  <div class="account-page p-4">
    <!-- 顶部信息 -->
    <div class="flex justify-between items-center mb-4">
      <div>
        <span>账号：{{ accountName }}</span>
        <span class="ml-4">Yuni账号数量：{{ yuniCount }}</span>
        <span class="ml-4">未使用套餐：{{ unusedPackage }}</span>
      </div>
      <div>
        <span>客服与你：<b class="text-red-500">jiejie8</b></span>
        <el-button type="text" @click="logout" class="ml-2">退出登录</el-button>
      </div>
    </div>

    <!-- 按钮区 -->
    <div class="flex mb-4 space-x-2">
      <el-button type="primary">添加Yuni账号</el-button>
      <el-button type="danger">添加套餐</el-button>
      <el-button type="warning">套餐列表</el-button>
      <el-button type="danger">一键停止</el-button>
      <el-button type="primary">批量发群</el-button>
      <el-button type="danger">批量删除</el-button>
      <el-button type="warning">追加内容</el-button>
    </div>

    <!-- 表格 -->
    <el-table :data="tableData" border style="width: 100%">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="nickname" label="昵称" width="120" />
      <el-table-column prop="phone" label="手机号" width="160" />
      <el-table-column prop="groupCount" label="群组数量" width="120" />
      <el-table-column prop="friendCount" label="好友数量" width="120" />
      <el-table-column prop="sendInterval" label="发送间隔" width="120" />
      <el-table-column prop="waitInterval" label="等待间隔" width="120" />
      <el-table-column prop="packageId" label="套餐ID" width="100" />
      <el-table-column prop="expireTime" label="过期时间" width="180" />
      <el-table-column prop="accountStatus" label="账号状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.accountStatus === '已失效' ? 'danger' : 'success'">
            {{ scope.row.accountStatus }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="taskStatus" label="任务状态" width="100" />
      <el-table-column prop="failCount" label="发送失败次数" width="120" />
      <el-table-column label="操作" fixed="right" width="260">
        <template #default="scope">
          <el-button size="small" type="primary" plain>配置发送频率</el-button>
          <el-button size="small" type="success" plain>发群</el-button>
          <el-button size="small" type="success" plain>发好友</el-button>
          <el-button size="small" type="danger" plain>删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup name="Dept">
import { listDept, getDept, delDept, addDept, updateDept, listDeptExcludeChild } from "@/api/system/dept"

const { proxy } = getCurrentInstance()
const { sys_normal_disable } = proxy.useDict("sys_normal_disable")

const deptList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const title = ref("")
const deptOptions = ref([])
const isExpandAll = ref(true)
const refreshTable = ref(true)

const data = reactive({
  form: {},
  queryParams: {
    deptName: undefined,
    status: undefined
  },
  rules: {
    parentId: [{ required: true, message: "上级部门不能为空", trigger: "blur" }],
    deptName: [{ required: true, message: "部门名称不能为空", trigger: "blur" }],
    orderNum: [{ required: true, message: "显示排序不能为空", trigger: "blur" }],
    email: [{ type: "email", message: "请输入正确的邮箱地址", trigger: ["blur", "change"] }],
    phone: [{ pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: "请输入正确的手机号码", trigger: "blur" }]
  },
})

const { queryParams, form, rules } = toRefs(data)

/** 查询部门列表 */
function getList() {
  loading.value = true
  listDept(queryParams.value).then(response => {
    deptList.value = proxy.handleTree(response.data, "deptId")
    loading.value = false
  })
}

/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}

/** 表单重置 */
function reset() {
  form.value = {
    deptId: undefined,
    parentId: undefined,
    deptName: undefined,
    orderNum: 0,
    leader: undefined,
    phone: undefined,
    email: undefined,
    status: "0"
  }
  proxy.resetForm("deptRef")
}

/** 搜索按钮操作 */
function handleQuery() {
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

/** 新增按钮操作 */
function handleAdd(row) {
  reset()
  listDept().then(response => {
    deptOptions.value = proxy.handleTree(response.data, "deptId")
  })
  if (row != undefined) {
    form.value.parentId = row.deptId
  }
  open.value = true
  title.value = "添加部门"
}

/** 展开/折叠操作 */
function toggleExpandAll() {
  refreshTable.value = false
  isExpandAll.value = !isExpandAll.value
  nextTick(() => {
    refreshTable.value = true
  })
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  listDeptExcludeChild(row.deptId).then(response => {
    deptOptions.value = proxy.handleTree(response.data, "deptId")
  })
  getDept(row.deptId).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改部门"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["deptRef"].validate(valid => {
    if (valid) {
      if (form.value.deptId != undefined) {
        updateDept(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addDept(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  proxy.$modal.confirm('是否确认删除名称为"' + row.deptName + '"的数据项?').then(function() {
    return delDept(row.deptId)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

getList()
</script>
