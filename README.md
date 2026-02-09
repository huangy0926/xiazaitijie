# export-solution-download

Hydro 插件：**下载题目/导出 ZIP 时同时导出题解**（写入每题目录下的 `solution/` 文件夹）。

## 功能

- 在 “题目下载 / 题库批量导出 ZIP” 的 zip 包中，额外写入：
  - `{pid}/solution/*.md`（题解/题解内容）
- 题解文件结构与 Hydro 自带导入逻辑兼容：`ProblemModel.import()` 会读取 `solution/` 目录并导入题解。

## 权限说明

插件后端 API 会复用 Hydro 的题解查看权限逻辑：

- 若用户已 AC 且有 `PERM_VIEW_PROBLEM_SOLUTION_ACCEPT`：允许导出题解
- 否则需要 `PERM_VIEW_PROBLEM_SOLUTION`
- 若无权限：导出会自动跳过题解，不影响其它文件（题面、测试数据等）导出

## 安装/启用

本插件不需要发布到 npm。推荐的使用方式是：**从 GitHub `git clone` 到服务器某个目录**，再把该目录路径写入 `addon.json`，重启 Hydro 即可。

### 推荐：从 GitHub 下载并启用（通用做法）

> 把下面的 `<你的插件仓库git地址>` 替换成你自己的仓库地址。

1. 在运行 Hydro 的机器上下载插件（示例放到 `/root/addons`）：

```bash
sudo -i
mkdir -p /root/addons
cd /root/addons
git clone <你的插件仓库git地址> export-solution-download
```

2. 启用插件：编辑 `/root/.hydro/addon.json`（一键安装版通常是 root）在数组里追加一项：

```json
"/root/addons/export-solution-download"
```

也可以用命令“追加”（不覆盖原有 addons）：

```bash
sudo -i
node -e 'const fs=require("fs");const p="/root/.hydro/addon.json";const a=JSON.parse(fs.readFileSync(p,"utf8"));const add="/root/addons/export-solution-download";if(a.indexOf(add)===-1)a.push(add);fs.writeFileSync(p,JSON.stringify(a,null,2));console.log(fs.readFileSync(p,"utf8"));'
```

3. 重启 Hydro：

```bash
pm2 restart hydrooj
```

4. 浏览器刷新（如不生效，通常是缓存/Service Worker 导致）：

- 先尝试 `Ctrl + F5` 强刷
- 不行就：F12 → Application → Service Workers → Unregister；Storage → Clear site data；再刷新

5. 以后更新插件（拉取新版本并重启）：

```bash
sudo -i
cd /root/addons/export-solution-download
git pull
pm2 restart hydrooj
```

### 方式 A：启用到 8888（一键安装版，通常是 root + pm2）

1. 将插件目录放在机器上任意路径（示例）：

```
/mnt/d/hydro/Hydro-master/Hydro-master/plugins/export-solution-download
```

2. 编辑 `/root/.hydro/addon.json`，加入插件路径（数组里追加一项）：

```json
[
  "@hydrooj/ui-default",
  "@hydrooj/hydrojudge",
  "@hydrooj/fps-importer",
  "@hydrooj/a11y",
  "/mnt/d/hydro/Hydro-master/Hydro-master/plugins/export-solution-download"
]
```

3. 重启：

```bash
pm2 restart hydrooj
```

### 方式 B：启用到 dev 实例（例如 8889）

编辑你的 dev profile：

- `~/.hydro/profiles/dev/addon.json`

加入插件路径（数组里追加一项），然后重启 dev 服务进程即可。

## 验证

在网页端导出题目 zip，解压后检查是否包含：

- `{pid}/solution/*.md`

## 实现概要

- 后端：注册 API `export.solutions`（读取题解列表并做权限校验）
  - 文件：`index.ts`
- 前端：监听 `problemset/download` 事件，把题解追加到 zip targets
  - 文件：`frontend/problemset_download.page.ts`

