<template>
  <div class="index-page">
    <!-- 顶部信息栏 -->
    <div class="header-bar">
      <div class="left-info">
        <span>账号: {{ username }}</span>
        <span>
          Yuni账号数量:
          <span class="count-pill">{{ tableData.length }}</span>
        </span>
        <span>
          未使用套餐:
          <el-link
              class="count-pill package-count-link"
              type="primary"
              @click="openPackageDialog"
          >
            {{ unusedPackageCount }}
          </el-link>
        </span>
      </div>
      <div class="right-info">
        <span class="service">客服与你: cc8202</span>
        <el-link type="primary" @click="logout">退出登录</el-link>
      </div>
    </div>

    <!-- 操作按钮区 -->
    <div class="toolbar">
      <div class="left-buttons">
        <el-button type="primary" @click="handleAddAccount">添加Yuni账号</el-button>
        <!--        <el-button type="danger" @click="handleAddPackage">添加套餐</el-button>-->
      </div>
      <div class="right-buttons" v-if="!isMobile">
        <el-button type="danger" @click="handleStopAll">一键停止</el-button>
        <el-button
            v-if="showSelection && selectionMode === 'stop'"
            type="primary"
            @click="submitStopAll"
        >确认停止</el-button>

        <el-button
            v-if="showSelection && selectionMode === 'freq'"
            type="primary"
            @click="confirmFrequencySelection"
        >下一步</el-button>
        <el-button
            v-if="showSelection && selectionMode === 'batch'"
            type="primary"
            @click="confirmBatchSelection"
        >下一步</el-button>
        <el-button type="primary" @click="handleBatchGroup">批量发群</el-button>
        <el-button type="primary" @click="handleEditFrequency">修改频率</el-button>
      </div>
      <div class="right-buttons mobile-actions" v-else>
        <el-dropdown trigger="click" @command="handleMobileAction">
          <el-button type="primary">
            操作
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="stopAll">一键停止</el-dropdown-item>
              <el-dropdown-item
                  command="confirmStop"
                  :disabled="!(showSelection && selectionMode === 'stop')"
              >
                确认停止
              </el-dropdown-item>
              <el-dropdown-item command="batchGroup">批量发群</el-dropdown-item>
              <el-dropdown-item
                  command="confirmBatch"
                  :disabled="!(showSelection && selectionMode === 'batch')"
              >
                下一步（批量发群）
              </el-dropdown-item>
              <el-dropdown-item command="editFreq">修改频率</el-dropdown-item>
              <el-dropdown-item
                  command="confirmFreq"
                  :disabled="!(showSelection && selectionMode === 'freq')"
              >
                下一步（修改频率）
              </el-dropdown-item>
              <el-dropdown-item
                  command="toggleAll"
                  :disabled="!showSelection"
              >
                全选/取消
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="table-wrapper">
      <el-table
          :data="tableData"
          style="width: 100%"
          :row-class-name="({ row }) => selectedUids.includes(row.uid) ? 'selected-row' : ''"
      >
        <el-table-column v-if="showSelection" width="40">
          <template #header>
            <el-checkbox
                :model-value="isAllSelected"
                @change="toggleSelectAll"
                style="transform: scale(0.9);"
            />
          </template>
          <template #default="{ row }">
            <el-checkbox
                :model-value="selectedUids.includes(row.uid)"
                @change="() => toggleSelect(row.uid)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="nickname" label="昵称" />
        <el-table-column v-if="!isMobile" prop="mobile" label="手机号" />
        <el-table-column v-if="!isMobile" prop="groupSize" label="群组数量">
          <template #default="{ row }">
            <span
                :style="{
                display: 'inline-block',
                minWidth: '60px',
                textAlign: 'center',
                fontWeight: 'bold',
                color: '#409EFF',
                backgroundColor: '#ecf5ff',
                border: '1px solid #b3d8ff',
                borderRadius: '6px',
                padding: '3px 8px',
                transition: 'all 0.3s'
              }"
            >
              {{ row.groupSize }}
            </span>
          </template>
        </el-table-column>
        <el-table-column v-if="!isMobile" prop="friendSize" label="好友数量">
          <template #default="{ row }">
            <span
                :style="{
                display: 'inline-block',
                minWidth: '60px',
                textAlign: 'center',
                fontWeight: 'bold',
                color: '#67C23A',
                backgroundColor: '#f0f9eb',
                border: '1px solid #c2e7b0',
                borderRadius: '6px',
                padding: '3px 8px',
                transition: 'all 0.3s'
              }"
            >
              {{ row.friendSize }}
            </span>
          </template>
        </el-table-column>
        <el-table-column v-if="!isMobile" prop="packageId" label="套餐ID" />
        <el-table-column v-if="!isMobile" prop="expireTime" label="过期时间" />
        <el-table-column v-if="!isMobile" prop="status" label="账号状态">
          <template #default="{ row }">
            <span :style="{ color: row.status === 1 ? '#67C23A' : '#F56C6C' }">
              {{ row.status === 1 ? '正常' : '失效' }}
            </span>
          </template>
        </el-table-column>
        <!--        <el-table-column prop="taskStatus" label="群组任务状态" />-->
        <el-table-column v-if="!isMobile" prop="taskStatus" label="群组任务状态">
          <template #default="{ row }">
            <span
                :style="{
                display: 'inline-block',
                padding: '4px 10px',
                borderRadius: '8px',
                border: '1px solid ' + (row.taskStatus === '发送中' ? '#67C23A' : '#F56C6C'),
                color: row.taskStatus === '发送中' ? '#67C23A' : '#F56C6C',
                backgroundColor: row.taskStatus === '发送中' ? '#f0f9eb' : '#fef0f0'
              }"
            >
              {{ row.taskStatus }}
            </span>
          </template>
        </el-table-column>
        <el-table-column v-if="!isMobile" prop="userTaskStatus" label="好友任务状态">
          <template #default="{ row }">
            <span
                :style="{
                display: 'inline-block',
                padding: '4px 10px',
                borderRadius: '8px',
                border: '1px solid ' + (row.userTaskStatus === '发送中' ? '#67C23A' : '#F56C6C'),
                color: row.userTaskStatus === '发送中' ? '#67C23A' : '#F56C6C',
                backgroundColor: row.userTaskStatus === '发送中' ? '#f0f9eb' : '#fef0f0'
              }"
            >
              {{ row.userTaskStatus }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="300">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button :size="isMobile ? 'small' : 'default'" type="primary"
                         @click="handleSendGroup(row, 2)">发群</el-button>
              <el-button v-if="!isMobile" :size="isMobile ? 'small' : 'default'" type="success"
                         @click="handleSendGroup(row, 1)">发好友</el-button>
              <el-button :size="isMobile ? 'small' : 'default'" type="danger"
                         @click="handleStopTask(row, 2)">
                {{ isMobile ? '停止' : '停止群组任务' }}
              </el-button>
              <el-button v-if="!isMobile" :size="isMobile ? 'small' : 'default'" type="danger"
                         @click="handleStopTask(row, 1)">停止好友任务</el-button>
              <el-button :size="isMobile ? 'small' : 'default'" type="danger" @click="handleDelete(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="tableData.length === 0" class="no-data">
        暂无数据
      </div>
    </div>

    <!-- 添加账号 抽屉弹窗 -->
    <el-drawer
        v-model="showDrawer"
        title="添加账号"
        direction="rtl"
        :size="isMobile ? '100%' : '40%'"
    >
      <div class="drawer-content">
        <h4>普通套餐（共享IP）</h4>
        <el-radio-group v-model="selectedPackage" class="package-radio">
          <el-radio
              v-for="pkg in packages"
              :key="pkg.id"
              :label="`${pkg.name}[id:${pkg.id}]`"
              style="display: flex; align-items: center; margin-bottom: 8px;"
          >
            <span style="flex: 1;">普通套餐：</span>
            <span>[id:{{ pkg.id }}]</span>
          </el-radio>
        </el-radio-group>

        <el-button type="primary" class="qrcode-btn" @click="generateQRCode">生成二维码</el-button>

        <div v-if="qrcodeSrc" class="qrcode-box">
          <img :src="qrcodeSrc" alt="二维码" />
        </div>

        <div class="login-tip">使用与你app扫码登录</div>
      </div>
    </el-drawer>

    <!-- 发送/批量/修改频率 抽屉 -->
    <el-drawer
        v-model="showSendDrawer"
        title="发群"
        direction="rtl"
        :size="isMobile ? '100%' : '50%'"
        @close="handleCloseSendDrawer"
    >
      <div class="send-group-drawer">
        <el-form
            ref="sendFormRef"
            :model="sendForm"
            :rules="rules"
            label-width="120px"
        >
          <!-- 修改频率模式隐藏内容类型 -->
          <el-form-item label="内容类型" v-if="!isEditFrequencyMode">
            <el-radio-group v-model="sendForm.contentType">
              <el-radio label="text">文字</el-radio>
              <el-radio label="image">图片</el-radio>
            </el-radio-group>
          </el-form-item>

          <!-- 修改频率模式隐藏发送内容 -->
          <el-form-item label="发送内容" v-if="!isEditFrequencyMode">
            <!-- 文字类型 -->
            <template v-if="sendForm.contentType === 'text'">
              <el-input
                  type="textarea"
                  v-model="sendForm.messageContent"
                  placeholder="请输入要发送的内容"
                  :rows="3"
              />
            </template>

            <!-- 图片类型 -->
            <template v-else>
              <el-upload
                  class="upload-demo"
                  action=""
                  :auto-upload="false"
                  :show-file-list="true"
                  accept="image/*"
                  :on-change="handleFileChange"
              >
                <el-button type="primary">选择图片</el-button>
                <template #tip>
                  <div class="el-upload__tip">仅支持图片文件（jpg/png等）</div>
                </template>
              </el-upload>
              <div v-if="sendForm.filePreview" style="margin-top: 10px;">
                <img :src="sendForm.filePreview" style="max-width: 100%; border-radius: 8px;" />
              </div>
            </template>
          </el-form-item>

          <el-form-item label="发送消息间隔" prop="sendInterval">
            <el-input-number v-model="sendForm.sendInterval" style="width: 150px;" :default-value="5" />
            <span class="unit">秒</span>
          </el-form-item>

          <div style="text-align: center; margin-top: 20px;">
            <template v-if="sendType === 2">
              <el-button type="primary" @click="handleStart(sendType)">开始发群</el-button>
            </template>
            <template v-if="sendType === 1">
              <el-button type="success" @click="handleStart(sendType)">开始发好友</el-button>
            </template>
            <template v-if="sendType === 3">
              <el-button type="success" @click="handleBatchStart()">批量发群</el-button>
            </template>
            <template v-if="sendType === 4">
              <el-button type="warning" @click="handleUpdateFrequency">确认修改</el-button>
            </template>
          </div>
        </el-form>

        <div class="status-table">
          <div class="toolbar">
            <el-button type="primary" size="small" @click="loadSendRecordByUid()">刷新列表</el-button>
          </div>
            <el-table :data="statusList" style="width: 100%; margin-top: 10px;">
              <el-table-column prop="groupName" label="名称" />
              <el-table-column prop="status" label="状态">
                <template #default="{ row }">
                  <span :style="{ color: row.status === 1 ? '#2ecc71' : '#e53935' }">
                    {{ row.status === 1 ? '发送成功' : '发送失败' }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="createTime" label="发送时间" />
              <el-table-column prop="failReason" label="失败原因" />
            </el-table>
          <div v-if="statusList.length === 0" class="no-data">暂无数据</div>
        </div>
      </div>
    </el-drawer>

    <el-dialog
        v-model="showPackageDialog"
        title="套餐列表"
        width="500px"
        :close-on-click-modal="false"
        :show-close="true"
    >
      <template #header>
        <div class="package-dialog-header">
          <span>套餐列表</span>
          <el-button
              v-if="isMobile"
              type="primary"
              link
              class="mobile-close"
              @click="showPackageDialog = false"
          >
            关闭
          </el-button>
        </div>
      </template>
      <div class="package-filter">
        <span>状态：</span>
        <el-select v-model="packageStatus" size="small" style="width: 140px;" @change="handlePackageStatusChange">
          <el-option
              v-for="item in packageStatusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          />
        </el-select>
      </div>
      <el-table :data="packages" style="width: 100%">
        <el-table-column prop="id" label="套餐ID" width="100" />
        <el-table-column prop="expireTime" label="过期时间" />
      </el-table>
      <div v-if="packages.length === 0" class="no-data">暂无套餐</div>
      <template #footer>
        <el-button type="primary" plain @click="showPackageDialog = false" style="width: 100%;">
          关闭
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import QRCode from 'qrcode'
import Cookies from "js-cookie"
import { ElMessageBox, ElMessage } from "element-plus"
import {
  getQRCode,
  getStatus,
  listByAccountId,
  listPackagesByStatus,
  addTask,
  addBatchTask,
  updateFrequency,
  listSendRecordByUid,
  getNotice,
  delNotice,
  addNotice,
  updateNotice,
  deleteUser,
  stopTask,
  stopAllTask
} from "@/api/system/yuni"

const isMobile = ref(window.innerWidth <= 768)
window.addEventListener('resize', () => {
  isMobile.value = window.innerWidth <= 768
})

const isEditFrequencyMode = ref(false)

const qrcodeSrc = ref('')

async function generateQRCode()  {
  // Guard: check if a package is selected
  if (!selectedPackage.value) {
    alert('请先选择一个套餐')
    return
  }
  const match = selectedPackage.value.match(/\[id:(\d+)\]/)
  const packageId = match ? match[1] : null
  if (!packageId) {
    alert('无法解析套餐ID，请重新选择套餐')
    return
  }
  try {
    const response = await getQRCode(packageId)
    const url = response.data
    qrcodeSrc.value = await QRCode.toDataURL(url)
    let uuid = url.split('=')[1]
    let count = 0
    let stopped = false

    async function pollStatus() {
      if (stopped) return

      count++
      console.log(`第 ${count} 次轮询...`)
      try {
        const res = await getStatus(uuid)
        console.log('轮询结果:', res)

        if (res.data) {
          console.log('✅ 登录成功，关闭弹窗')
          handleCloseDrawer()
          stopped = true
          return
        }

        if (count >= 40) {
          console.log('⏹ 已达到最大轮询次数（40次），停止轮询')
          stopped = true
          return
        }

      } catch (pollErr) {
        console.error('轮询接口错误:', pollErr)
        if (count >= 40) {
          console.log('⏹ 已达到最大轮询次数（40次），停止轮询')
          stopped = true
          return
        }
      }

      if (!stopped) {
        setTimeout(pollStatus, 3000)
      }
    }

    pollStatus()
  } catch (err) {
    console.error('获取二维码失败:', err)
  }
}

const tableData = ref([])
const packages = ref([])
const unusedPackageCount = ref(0)
const packageStatus = ref(0)
const packageStatusOptions = [
  { label: '未使用', value: 0 },
  { label: '使用中', value: 1 },
  { label: '已过期', value: 2 },
]

const loadPackages = async (status = packageStatus.value) => {
  try {
    const res = await listPackagesByStatus(status, 1, 1000)
    // 接口返回 PageInfo 对象，取 list 作为真实数据
    const data = res.data?.list ?? res.data ?? []
    packages.value = data
    packageStatus.value = status
    if (status === 0) {
      unusedPackageCount.value = packages.value.length
    }
    console.log('套餐列表:', packages.value)
  } catch (err) {
    console.error('获取套餐列表失败:', err)
  }
}

const loadAccountList = async () => {
  try {
    const res = await listByAccountId()
    tableData.value = res.data || []
  } catch (err) {
    console.error('获取账号列表失败:', err)
  }
}

const statusList = ref([])
const currentItem = ref(null)

const loadSendRecordByUid = async () => {
  if (!currentItem.value || !currentItem.value.uid) {
    statusList.value = []
    return
  }
  try {
    const res = await listSendRecordByUid(currentItem.value.uid)
    statusList.value = res.data || []
  } catch (err) {
    console.error('获取发送记录失败:', err)
  }
}

onMounted(async () => {
  try {
    const res = await listByAccountId()
    tableData.value = res.data || []
  } catch (err) {
    console.error('获取账号列表失败:', err)
  }
})

const handleCloseDrawer = () => {
  showDrawer.value = false
  loadAccountList()
}

onMounted(async () => {
  loadPackages()
})

const showDrawer = ref(false)
const selectedPackage = ref('')
const showSendDrawer = ref(false)
const sendType = ref(2)
const showPackageDialog = ref(false)

const sendForm = ref({
  contentType: 'text',
  messageContent: '',
  sendInterval: 5,
  file: null,
  filePreview: ''
})

const sendFormRef = ref(null)

const rules = {
  sendInterval: [
    { required: true, message: '请填写发送消息间隔', trigger: 'blur' },
  ],
}

const handleFileChange = (file) => {
  sendForm.value.file = file.raw
  const reader = new FileReader()
  reader.onload = (e) => {
    sendForm.value.filePreview = e.target.result
  }
  reader.readAsDataURL(file.raw)
}

const showSelection = ref(false)
const selectedUids = ref([])
const selectionMode = ref('') // '', 'stop', 'freq'

const isAllSelected = computed(() => {
  return tableData.value.length > 0 && selectedUids.value.length === tableData.value.length
})

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedUids.value = []
  } else {
    selectedUids.value = tableData.value.map(item => item.uid)
  }
}

const toggleSelect = (uid) => {
  if (!uid) return
  const idx = selectedUids.value.indexOf(uid)
  if (idx === -1) {
    selectedUids.value.push(uid)
  } else {
    selectedUids.value.splice(idx, 1)
  }
}

const submitStopAll = async () => {
  if (selectedUids.value.length === 0) {
    ElMessage.warning('请先选择要停止的账号')
    return
  }
  try {
    await stopAllTask(selectedUids.value)
    ElMessage.success('已停止所选账号任务')
    showSelection.value = false
    selectedUids.value = []
    await loadAccountList()
  } catch (err) {
    console.error(err)
    ElMessage.error('停止失败，请稍后重试')
  }
}

const handleAddAccount = async () => {
  await loadPackages(0)
  qrcodeSrc.value = ''
  showDrawer.value = true
}
const handleAddPackage = () => {}
const handleStopAll = () => {
  if (selectionMode.value === 'stop' && showSelection.value) {
    showSelection.value = false
    selectedUids.value = []
    selectionMode.value = ''
  } else {
    selectionMode.value = 'stop'
    showSelection.value = true
    selectedUids.value = []
  }
}
const handleBatchSend = () => {}
const handleBatchDelete = () => {}
const handleAddContent = () => {}
const logout = () => {
  document.cookie = "Admin-Token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;"
  window.location.href = '/login'
}
const openPackageDialog = async () => {
  packageStatus.value = 0
  await loadPackages(0)
  showPackageDialog.value = true
}
const handlePackageStatusChange = async (status) => {
  await loadPackages(status ?? 0)
}
const handleMobileAction = (command) => {
  switch (command) {
    case 'stopAll':
      handleStopAll()
      break
    case 'confirmStop':
      submitStopAll()
      break
    case 'batchGroup':
      handleBatchGroup()
      break
    case 'confirmBatch':
      confirmBatchSelection()
      break
    case 'editFreq':
      handleEditFrequency()
      break
    case 'confirmFreq':
      confirmFrequencySelection()
      break
    case 'toggleAll':
      toggleSelectAll()
      break
    default:
      break
  }
}

const username = ref(Cookies.get('username') || '')

const handleSendGroup = (item, type = 2) => {
  currentItem.value = item
  sendType.value = type
  isEditFrequencyMode.value = false
  showSendDrawer.value = true
  loadSendRecordByUid()
}

const handleBatchGroup = () => {
  selectionMode.value = 'batch'
  showSelection.value = true
  selectedUids.value = []

  isEditFrequencyMode.value = false
  sendType.value = 3
  currentItem.value = null
  statusList.value = []
}

const handleEditFrequency = () => {
  selectionMode.value = 'freq'
  showSelection.value = true
  selectedUids.value = []

  isEditFrequencyMode.value = false
  sendType.value = 4
  currentItem.value = null
  statusList.value = []
}

const confirmFrequencySelection = () => {
  if (selectedUids.value.length === 0) {
    ElMessage.warning('请先选择要修改频率的账号')
    return
  }
  isEditFrequencyMode.value = true
  sendType.value = 4
  showSendDrawer.value = true
  currentItem.value = null
  statusList.value = []
  showSelection.value = false
}

const confirmBatchSelection = () => {
  if (selectedUids.value.length === 0) {
    ElMessage.warning('请先选择要发群的账号')
    return
  }
  isEditFrequencyMode.value = false
  sendType.value = 3
  showSendDrawer.value = true
  currentItem.value = null
  statusList.value = []
  showSelection.value = false
}

const handleStart = async (type) => {
  sendFormRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      const formData = new FormData()
      formData.append('uid', currentItem.value.uid)
      formData.append('sendInterval', sendForm.value.sendInterval)
      formData.append('messageContent', sendForm.value.messageContent)
      formData.append('cvsType', type)
      if (sendForm.value.file) {
        formData.append('file', sendForm.value.file)
      }
      const res = await addTask(formData)
      await loadAccountList()
      console.log('任务添加成功:', res)
      ElMessage.success('任务已开始')
      showSendDrawer.value = false
      isEditFrequencyMode.value = false
    } catch (err) {
      console.error('任务添加失败:', err)
      ElMessage.error('任务启动失败，请重试')
    }
  })
}

const handleBatchStart = async () => {
  sendFormRef.value.validate(async (valid) => {
    if (!valid) return
    if (selectedUids.value.length === 0) {
      ElMessage.warning('未选择账号，无法批量发群')
      return
    }
    try {
      const formData = new FormData()
      formData.append('sendInterval', sendForm.value.sendInterval)
      formData.append('messageContent', sendForm.value.messageContent)
      formData.append('uids', selectedUids.value)
      if (sendForm.value.file) {
        formData.append('file', sendForm.value.file)
      }
      await addBatchTask(formData)
      await loadAccountList()
      ElMessage.success('批量任务已开始')
      showSendDrawer.value = false
      isEditFrequencyMode.value = false
      selectionMode.value = ''
      selectedUids.value = []
    } catch (err) {
      console.error('任务添加失败:', err)
      ElMessage.error('任务启动失败，请重试')
    }
  })
}

const handleUpdateFrequency = async () => {
  try {
    if (selectedUids.value.length === 0) {
      ElMessage.warning('未选择账号，无法修改频率')
      return
    }

    const formData = new FormData()
    formData.append('sendInterval', sendForm.value.sendInterval)
    formData.append('uids', selectedUids.value)

    await updateFrequency(formData)
    await loadAccountList()
    ElMessage.success('频率修改成功')

    showSendDrawer.value = false
    isEditFrequencyMode.value = false
    selectionMode.value = ''
    selectedUids.value = []
  } catch (err) {
    console.error('修改频率失败:', err)
    ElMessage.error('修改失败，请重试')
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
        `确认删除账号【${row.nickname || row.mobile}】吗？`,
        '提示',
        { type: 'warning' }
    )
    await deleteUser(row.id)
    ElMessage.success('删除成功')
    tableData.value = tableData.value.filter(item => item.id !== row.id)
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('删除失败')
      console.error(err)
    }
  }
}

// 停止任务
const handleStopTask = async (row, cvsType) => {
  try {
    const typeLabel = cvsType === 2 ? '群组' : '好友'
    await ElMessageBox.confirm(
        `确认停止账号【${row.nickname || row.mobile}】的${typeLabel}任务吗？`,
        '提示',
        { type: 'warning' }
    )
    await stopTask(row.uid, cvsType)
    ElMessage.success(`${typeLabel}任务已停止`)
    if (cvsType === 2) {
      row.taskStatus = '已停止'
    } else {
      row.userTaskStatus = '已停止'
    }
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('停止任务失败')
      console.error(err)
    }
  }
}

const handleCloseSendDrawer = () => {
  showSendDrawer.value = false
  isEditFrequencyMode.value = false
}
</script>

<style scoped>
.index-page {
  width: 100%;
  margin: 0;
  padding: 20px 40px;
  height: 100vh;
  background-color: #ffffff;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.left-info span {
  color: #333;
}
.left-info {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.left-info > span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.right-info {
  display: flex;
  align-items: center;
}

.service {
  color: #d32f2f;
  margin-right: 12px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8f9fa;
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.table-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
}

.no-data {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.drawer-content {
  padding: 10px 20px;
}

.package-radio {
  display: flex;
  flex-direction: column;
  margin: 10px 0 20px;
}

.qrcode-btn {
  margin-bottom: 20px;
}

.login-tip {
  text-align: center;
  font-size: 14px;
  color: #666;
  margin-top: 10px;
}

.qrcode-box {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.qrcode-box img {
  width: 180px;
  height: 180px;
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 8px;
  background: #fff;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: flex-start;
}

.send-group-drawer {
  padding: 10px 20px;
}

.unit {
  margin-left: 4px;
  color: #666;
}

.selected-row {
  background-color: #fcefdc !important;
}

.selected-row:hover {
  background-color: #fae3c1 !important;
}

.mobile-actions {
  justify-content: flex-end;
}

.package-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.mobile-close {
  font-weight: 600;
}
.package-filter {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 8px;
}
.count-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  padding: 2px 8px;
  font-weight: 600;
  border: 1px solid #409eff;
  border-radius: 14px;
  text-decoration: none;
  background-color: #e6f1ff;
}
.package-count-link {
  color: #409eff;
}
.package-count-link:hover {
  text-decoration: underline;
  background-color: #d8e9ff;
}
</style>
