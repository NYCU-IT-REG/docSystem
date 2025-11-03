# 使用 NGC 映像檔

NVIDIA GPU Cloud (NGC) 是 NVIDIA 提供的容器映像檔倉庫，包含針對 GPU 優化的深度學習框架、HPC 應用程式和科學運算工具。這些映像檔經過 NVIDIA 工程師優化，能充分發揮 GPU 的效能。

## 什麼是 NGC

NGC 提供以下類型的容器映像檔：

**深度學習框架**
- PyTorch
- TensorFlow
- JAX
- MXNet
- PaddlePaddle

**機器學習工具**
- RAPIDS (GPU 加速的資料科學)
- cuML (GPU 加速的機器學習)
- NVIDIA Triton Inference Server

**HPC 應用程式**
- GROMACS (分子動力學模擬)
- LAMMPS (經典分子動力學)
- NAMD (分子動力學)

**開發工具**
- CUDA
- cuDNN
- TensorRT
- NVIDIA HPC SDK

## NGC 容器的優勢

1. **效能優化**：針對 NVIDIA GPU 進行深度優化
2. **版本匹配**：確保 CUDA、cuDNN 等元件版本相容
3. **定期更新**：每月更新，包含最新功能和安全修補
4. **完整測試**：經過 NVIDIA 工程團隊測試驗證
5. **開箱即用**：無需手動配置 GPU 相關設定

## 瀏覽 NGC 映像檔

### NGC Catalog 網站

訪問 [NGC Catalog](https://catalog.ngc.nvidia.com/) 瀏覽所有可用的容器映像檔：

1. 選擇 "Containers" 分類
2. 使用搜尋功能找到需要的軟體
3. 查看映像檔的詳細資訊、版本和使用說明

### 映像檔命名規則

NGC 映像檔的命名遵循以下格式：

```
nvcr.io/nvidia/<軟體名稱>:<版本標籤>
```

常見的版本標籤格式：
- `YY.MM-py3`：年月版本，例如 `23.12-py3` 表示 2023 年 12 月版本
- `X.Y.Z-cudaXX.X-ubuntuXX.XX`：詳細版本資訊

範例：
```bash
nvcr.io/nvidia/pytorch:23.12-py3
nvcr.io/nvidia/tensorflow:23.12-tf2-py3
nvcr.io/nvidia/cuda:12.0.0-base-ubuntu22.04
```

## 下載 NGC 映像檔

:::warning 注意
目前儲存庫功能正在建置中，若有需求請向管理員取得 API key。
:::

### 基本下載方式

使用 `singularity pull` 指令下載 NGC 映像檔：

```bash
# 基本語法
singularity pull docker://nvcr.io/nvidia/<軟體名稱>:<版本>

# 範例：下載 PyTorch 容器
singularity pull docker://nvcr.io/nvidia/pytorch:23.12-py3

# 會產生 pytorch_23.12-py3.sif 檔案
```

### 指定輸出檔名

```bash
# 自訂輸出檔名
singularity pull pytorch-2312.sif docker://nvcr.io/nvidia/pytorch:23.12-py3
```

### 常用 NGC 映像檔下載範例

#### PyTorch

```bash
# 最新的 PyTorch 容器
singularity pull docker://nvcr.io/nvidia/pytorch:23.12-py3

# 檢視容器資訊
singularity inspect pytorch_23.12-py3.sif
```

#### TensorFlow

```bash
# TensorFlow 2.x
singularity pull docker://nvcr.io/nvidia/tensorflow:23.12-tf2-py3

# TensorFlow 1.x (舊版)
singularity pull docker://nvcr.io/nvidia/tensorflow:23.12-tf1-py3
```

#### CUDA 開發環境

```bash
# CUDA 12.0 基礎環境
singularity pull docker://nvcr.io/nvidia/cuda:12.0.0-base-ubuntu22.04

# CUDA 12.0 開發環境 (包含編譯工具)
singularity pull docker://nvcr.io/nvidia/cuda:12.0.0-devel-ubuntu22.04

# CUDA 12.0 執行環境
singularity pull docker://nvcr.io/nvidia/cuda:12.0.0-runtime-ubuntu22.04
```

#### RAPIDS (資料科學)

```bash
# RAPIDS 完整環境
singularity pull docker://nvcr.io/nvidia/rapidsai/rapidsai:23.12-cuda12.0-runtime-ubuntu22.04
```

## NGC 映像檔版本選擇

### 選擇適當版本的建議

**1. 使用最新穩定版本**
- 適合新專案
- 獲得最新功能和效能改進
- 範例：`pytorch:23.12-py3`

**2. 固定版本號**
- 適合需要重現研究結果的情況
- 確保環境一致性
- 範例：`pytorch:23.08-py3`

**3. 檢查 CUDA 版本相容性**
- 確認 HPC 系統的 GPU 驅動版本
- 選擇相容的 CUDA 版本

### 查看映像檔詳細資訊

在 NGC Catalog 網站上，每個容器頁面都會提供：

- **Release Notes**：版本更新說明
- **Framework Version**：包含的軟體版本
- **CUDA Version**：CUDA 工具包版本
- **Container Size**：映像檔大小
- **Pull Command**：下載指令

## 使用 NGC API Key

某些私有或早期存取的容器可能需要 NGC API Key。

### 取得 API Key

1. 前往 [NGC 網站](https://ngc.nvidia.com/)
2. 註冊或登入帳號
3. 進入 "Setup" > "Get API Key"
4. 產生新的 API Key

### 使用 API Key 下載

```bash
# 設定環境變數
export SINGULARITY_DOCKER_USERNAME='$oauthtoken'
export SINGULARITY_DOCKER_PASSWORD='your_api_key_here'

# 下載需要認證的映像檔
singularity pull docker://nvcr.io/nvidia/private-image:tag
```

:::info 提示
在 HPC 環境中，建議將 API Key 儲存在家目錄的設定檔中，避免在指令中直接顯示。
:::

## 測試下載的映像檔

下載完成後，應該測試映像檔是否正常運作：

### 檢查映像檔資訊

```bash
# 查看映像檔基本資訊
singularity inspect pytorch_23.12-py3.sif

# 查看標籤資訊
singularity inspect --labels pytorch_23.12-py3.sif

# 查看說明文件
singularity run-help pytorch_23.12-py3.sif
```

### 測試容器功能

```bash
# 檢查 Python 版本
singularity exec pytorch_23.12-py3.sif python --version

# 檢查 PyTorch 版本和 CUDA 可用性
singularity exec pytorch_23.12-py3.sif python -c "import torch; print(f'PyTorch: {torch.__version__}'); print(f'CUDA available: {torch.cuda.is_available()}')"

# 檢查 GPU (需要在有 GPU 的節點上執行)
singularity exec --nv pytorch_23.12-py3.sif nvidia-smi
```

### 互動式測試

```bash
# 進入容器的 shell
singularity shell --nv pytorch_23.12-py3.sif

# 在容器內測試
Singularity> python
>>> import torch
>>> print(torch.__version__)
>>> print(torch.cuda.is_available())
>>> exit()
Singularity> exit
```

## 整合到 Slurm 工作

將 NGC 容器整合到批次工作中：

```bash
#!/bin/bash
#SBATCH -J pytorch_training
#SBATCH -p gpu
#SBATCH --gres=gpu:1
#SBATCH -c 8
#SBATCH -t 24:00:00
#SBATCH -o output_%j.txt
#SBATCH -e error_%j.txt

# 設定容器路徑
CONTAINER="/path/to/pytorch_23.12-py3.sif"

# 使用容器執行訓練程式
singularity exec --nv ${CONTAINER} python train.py \
    --data /data/dataset \
    --epochs 100 \
    --batch-size 64

# 或使用多個 GPU
# singularity exec --nv ${CONTAINER} python -m torch.distributed.launch \
#     --nproc_per_node=4 train.py
```

## 常見 NGC 容器使用範例

### PyTorch 深度學習訓練

```bash
# 下載 PyTorch 容器
singularity pull docker://nvcr.io/nvidia/pytorch:23.12-py3

# 互動式開發
srun -p gpu --gres=gpu:1 -c 8 --pty singularity shell --nv pytorch_23.12-py3.sif

# 批次訓練
singularity exec --nv pytorch_23.12-py3.sif python train.py
```

### TensorFlow 模型訓練

```bash
# 下載 TensorFlow 容器
singularity pull docker://nvcr.io/nvidia/tensorflow:23.12-tf2-py3

# 執行訓練
singularity exec --nv tensorflow_23.12-tf2-py3.sif python model_train.py
```

### RAPIDS 資料分析

```bash
# 下載 RAPIDS 容器
singularity pull docker://nvcr.io/nvidia/rapidsai/rapidsai:23.12-cuda12.0-runtime-ubuntu22.04

# 執行 GPU 加速的資料分析
singularity exec --nv rapidsai_23.12-cuda12.0-runtime-ubuntu22.04.sif python analysis.py
```

### Jupyter Notebook

許多 NGC 容器內建 Jupyter，可以啟動 Notebook 服務：

```bash
# 在計算節點上啟動 Jupyter
srun -p gpu --gres=gpu:1 -c 8 --pty singularity exec --nv pytorch_23.12-py3.sif \
    jupyter notebook --ip=0.0.0.0 --port=8888 --no-browser
```

## 映像檔管理建議

### 儲存位置

建議將常用的映像檔儲存在專案目錄或共享空間：

```bash
# 在專案目錄建立 containers 資料夾
mkdir -p ~/projects/myproject/containers

# 下載映像檔到指定位置
cd ~/projects/myproject/containers
singularity pull docker://nvcr.io/nvidia/pytorch:23.12-py3
```

### 版本管理

為映像檔建立有意義的命名：

```bash
# 包含日期和專案資訊
singularity pull pytorch-2312-project-v1.sif docker://nvcr.io/nvidia/pytorch:23.12-py3

# 或使用軟連結管理版本
ln -s pytorch_23.12-py3.sif pytorch-current.sif
```

### 定期更新

定期檢查並更新映像檔：

```bash
# 下載新版本
singularity pull pytorch_24.01-py3.sif docker://nvcr.io/nvidia/pytorch:24.01-py3

# 測試新版本
singularity exec --nv pytorch_24.01-py3.sif python test_script.py

# 確認無誤後替換舊版本
```

## 常見問題

**Q: NGC 容器需要註冊帳號嗎？**

A: 大部分公開的容器不需要註冊即可下載，但建議註冊以存取完整的資源和文件。

**Q: 如何選擇 PyTorch 或 TensorFlow 的版本？**

A: 建議先查看 NGC Catalog 上的 Release Notes，了解各版本包含的框架版本和 CUDA 版本，選擇符合需求的版本。

**Q: NGC 容器的映像檔很大，下載很慢怎麼辦？**

A: 可以選擇較小的基礎版本，或在網路較好的時段下載。也可以考慮先在本機下載後上傳到 HPC。

**Q: 可以在 NGC 容器中安裝額外的 Python 套件嗎？**

A: 容器內的檔案系統是唯讀的，但可以使用 `pip install --user` 安裝到使用者目錄，或建立自訂的容器映像檔。

**Q: NGC 容器支援多 GPU 訓練嗎？**

A: 支援，NGC 容器內建多 GPU 支援。使用時需要在 Slurm 腳本中申請多個 GPU，並使用相應的分散式訓練方式。

## 相關資源

- [NGC Catalog](https://catalog.ngc.nvidia.com/) - NVIDIA GPU Cloud 映像檔目錄
- [NGC 文件](https://docs.nvidia.com/ngc/) - NGC 使用文件
- [PyTorch 容器說明](https://catalog.ngc.nvidia.com/orgs/nvidia/containers/pytorch) - PyTorch 容器詳細資訊
- [TensorFlow 容器說明](https://catalog.ngc.nvidia.com/orgs/nvidia/containers/tensorflow) - TensorFlow 容器詳細資訊
