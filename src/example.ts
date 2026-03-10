/**
 * OpenCode 服务使用示例
 * 展示如何使用封装的 OpenCode 服务类
 */

import { initOpenCodeService, getOpenCodeService, OpenCodeServerService } from './opencode-service';

/**
 * 初始化 OpenCode 服务
 * 注意：将 'https://api.opencode.ai' 替换为实际的 API 基础 URL
 */
export const openCodeService = initOpenCodeService('https://api.opencode.ai', {
  timeout: 30000,
  headers: {
    // 如果需要认证，在这里添加 token
    // 'Authorization': 'Bearer YOUR_API_TOKEN',
  },
});

// 或者使用单例模式
// const openCodeService = getOpenCodeService();

/**
 * 示例 1: 获取所有服务器列表
 */
export async function listAllServers() {
  try {
    const response = await openCodeService.listServers();
    console.log('服务器列表:', response.data);
    return response.data;
  } catch (error) {
    console.error('获取服务器列表失败:', error);
    throw error;
  }
}

/**
 * 示例 2: 获取服务器列表（带分页和筛选）
 */
export async function listServersWithFilters() {
  try {
    const response = await openCodeService.listServers({
      page: 1,
      pageSize: 10,
      type: 'production',
      status: 'running',
    });
    console.log('服务器列表（带筛选）:', response.data);
    return response.data;
  } catch (error) {
    console.error('获取服务器列表失败:', error);
    throw error;
  }
}

/**
 * 示例 3: 获取单个服务器详情
 */
export async function getServerDetails(serverId: string) {
  try {
    const response = await openCodeService.getServer(serverId);
    console.log('服务器详情:', response.data);
    return response.data;
  } catch (error) {
    console.error('获取服务器详情失败:', error);
    throw error;
  }
}

/**
 * 示例 4: 创建新服务器
 */
export async function createNewServer() {
  try {
    const response = await openCodeService.createServer({
      name: 'my-test-server',
      description: '这是一个测试服务器',
      type: 'development',
      config: {
        region: 'us-east-1',
        size: 'small',
      },
    });
    console.log('创建服务器成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('创建服务器失败:', error);
    throw error;
  }
}

/**
 * 示例 5: 更新服务器信息
 */
export async function updateServerInfo(serverId: string) {
  try {
    const response = await openCodeService.updateServer(serverId, {
      description: '更新后的服务器描述',
      config: {
        region: 'us-west-2',
      },
    });
    console.log('更新服务器成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('更新服务器失败:', error);
    throw error;
  }
}

/**
 * 示例 6: 启动服务器
 */
export async function startServer(serverId: string) {
  try {
    const response = await openCodeService.startServer(serverId);
    console.log('启动服务器成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('启动服务器失败:', error);
    throw error;
  }
}

/**
 * 示例 7: 停止服务器
 */
export async function stopServer(serverId: string) {
  try {
    const response = await openCodeService.stopServer(serverId);
    console.log('停止服务器成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('停止服务器失败:', error);
    throw error;
  }
}

/**
 * 示例 8: 重启服务器
 */
export async function restartServer(serverId: string) {
  try {
    const response = await openCodeService.restartServer(serverId);
    console.log('重启服务器成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('重启服务器失败:', error);
    throw error;
  }
}

/**
 * 示例 9: 获取服务器状态
 */
export async function checkServerStatus(serverId: string) {
  try {
    const response = await openCodeService.getServerStatus(serverId);
    console.log('服务器状态:', response.data);
    return response.data;
  } catch (error) {
    console.error('获取服务器状态失败:', error);
    throw error;
  }
}

/**
 * 示例 10: 获取服务器日志
 */
export async function fetchServerLogs(serverId: string) {
  try {
    const response = await openCodeService.getServerLogs(serverId, {
      lines: 100,
      tail: true,
    });
    console.log('服务器日志:', response.data);
    return response.data;
  } catch (error) {
    console.error('获取服务器日志失败:', error);
    throw error;
  }
}

/**
 * 示例 11: 删除服务器
 */
export async function deleteServerById(serverId: string) {
  try {
    const response = await openCodeService.deleteServer(serverId);
    console.log('删除服务器成功');
    return response;
  } catch (error) {
    console.error('删除服务器失败:', error);
    throw error;
  }
}

/**
 * 示例 12: 使用自定义请求
 * 用于调用上述方法未涵盖的其他接口
 */
export async function customApiCall() {
  try {
    const response = await openCodeService.customRequest({
      path: 'custom/endpoint',
      method: 'POST',
      body: {
        some: 'data',
      },
    });
    console.log('自定义请求成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('自定义请求失败:', error);
    throw error;
  }
}

/**
 * 主程序示例
 */
export async function main() {
  console.log('开始运行 OpenCode 服务示例...\n');

  // 示例：获取服务器列表
  await listAllServers();

  // 示例：创建新服务器
  // const newServer = await createNewServer();
  // await startServer(newServer.id);
  // await checkServerStatus(newServer.id);

  console.log('\n所有示例执行完成！');
}

// 如果直接运行此文件，则执行 main 函数
if (require.main === module) {
  main().catch(console.error);
}
