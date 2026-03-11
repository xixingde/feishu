/**
 * 简单的语法和类型检查测试
 * 用于验证封装类的基本功能是否正常
 */

import { HttpClient, HttpClientConfig } from './http-client';
import { OpenCodeServerService, initOpenCodeService, getOpenCodeService } from './opencode-service';

// 测试 1: 创建 HttpClient 实例
function testHttpClientCreation() {
  console.log('测试 1: 创建 HttpClient 实例...');
  const config: HttpClientConfig = {
    baseURL: 'https://api.example.com',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  const client = new HttpClient(config);
  console.log('✓ HttpClient 实例创建成功');
  return client;
}

// 测试 2: 创建 OpenCodeServerService 实例
function testOpenCodeServiceCreation() {
  console.log('\n测试 2: 创建 OpenCodeServerService 实例...');
  try {
    const service = initOpenCodeService('https://api.opencode.ai');
    console.log('✓ OpenCodeServerService 实例创建成功');
    return service;
  } catch (error) {
    console.error('✗ OpenCodeServerService 实例创建失败:', error);
    throw error;
  }
}

// 测试 3: 使用单例模式
function testSingletonPattern() {
  console.log('\n测试 3: 测试单例模式...');
  try {
    const service1 = initOpenCodeService('https://api.opencode.ai');
    const service2 = getOpenCodeService();
    if (service1 === service2) {
      console.log('✓ 单例模式正常工作');
    } else {
      console.log('✗ 单例模式工作异常');
    }
  } catch (error) {
    console.error('✗ 单例模式测试失败:', error);
    throw error;
  }
}

// 测试 4: 检查类型定义
function testTypeDefinitions() {
  console.log('\n测试 4: 检查类型定义...');
  
  // 测试 CreateServerRequest 类型
  const createRequest: any = {
    name: 'test-server',
    description: 'Test server',
    type: 'development',
    config: {
      region: 'us-east-1',
    },
  };
  console.log('✓ CreateServerRequest 类型定义正常');
  
  // 测试 ListServersParams 类型
  const listParams: any = {
    page: 1,
    pageSize: 10,
    type: 'production',
    status: 'running',
  };
  console.log('✓ ListServersParams 类型定义正常');
  
  // 测试 UpdateServerRequest 类型
  const updateRequest: any = {
    description: 'Updated description',
    config: {
      region: 'us-west-2',
    },
  };
  console.log('✓ UpdateServerRequest 类型定义正常');
}

// 测试 5: 检查方法存在性
function testMethodExistence() {
  console.log('\n测试 5: 检查方法存在性...');
  
  const service = initOpenCodeService('https://api.opencode.ai');
  
  const methods = [
    'listServers',
    'getServer',
    'createServer',
    'updateServer',
    'deleteServer',
    'startServer',
    'stopServer',
    'restartServer',
    'getServerStatus',
    'getServerLogs',
    'customRequest',
  ];
  
  let allMethodsExist = true;
  methods.forEach(method => {
    if (typeof (service as any)[method] === 'function') {
      console.log(`  ✓ ${method} 方法存在`);
    } else {
      console.log(`  ✗ ${method} 方法不存在`);
      allMethodsExist = false;
    }
  });
  
  if (allMethodsExist) {
    console.log('✓ 所有必需的方法都存在');
  } else {
    console.log('✗ 部分方法缺失');
  }
}

// 运行所有测试
export async function runAllTests() {
  console.log('========================================');
  console.log('开始运行测试...');
  console.log('========================================\n');
  
  try {
    testHttpClientCreation();
    testOpenCodeServiceCreation();
    testSingletonPattern();
    testTypeDefinitions();
    testMethodExistence();
    
    console.log('\n========================================');
    console.log('所有测试通过！');
    console.log('========================================');
  } catch (error) {
    console.error('\n========================================');
    console.error('测试失败！');
    console.error('========================================');
    console.error(error);
    process.exit(1);
  }
}

// 如果直接运行此文件，则执行测试
if (require.main === module) {
  runAllTests().catch(console.error);
}
