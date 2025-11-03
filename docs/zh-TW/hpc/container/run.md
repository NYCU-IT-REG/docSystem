# 執行容器

本章節說明如何在 HPC 環境中執行容器。我們支援兩種容器執行工具：Singularity 和 Enroot，各有不同的特點和使用情境。

## 容器執行工具比較

| 特性 | Singularity | Enroot |
|------|-------------|--------|
| 映像檔格式 | .sif (單一檔案) | 目錄結構 |
| 啟動速度 | 快 | 更快 |
| 儲存空間 | 映像檔較大 | 可共享層級，節省空間 |
| 使用複雜度 | 簡單 | 稍複雜 |
| 適合情境 | 一般用途、可攜性 | 大量重複執行、Slurm 整合 |

## Singularity 執行方式

Singularity 是最常用的 HPC 容器工具，提供簡單直觀的使用方式。

### 基本執行模式

#### 1. exec - 執行指定指令

在容器中執行單一指令：

```bash
# 基本語法
singularity exec [選項] <映像檔> <指令>

# 範例：執行 Python 腳本
singularity exec pytorch.sif python train.py

# 範例：查看容器內的 Python 版本
singularity exec pytorch.sif python --version
```

#### 2. shell - 互動式 Shell

進入容器的互動式環境：

```bash
# 基本語法
singularity shell [選項] <映像檔>

# 範例：進入容器
singularity shell pytorch.sif

# 在容器內操作
Singularity> python --version
Singularity> pip list
Singularity> exit
```

#### 3. run - 執行預設指令

執行容器定義的預設指令（runscript）：

```bash
# 基本語法
singularity run [選項] <映像檔> [參數]

# 範例
singularity run pytorch.sif --help
```

### 常用選項

#### GPU 支援

使用 `--nv` 選項讓容器存取 NVIDIA GPU：

```bash
# 啟用 GPU 支援
singularity exec --nv pytorch.sif python train.py

# 檢查 GPU 是否可用
singularity exec --nv pytorch.sif nvidia-smi
```

#### 綁定掛載目錄

使用 `--bind` 或 `-B` 將主機目錄掛載到容器中：

```bash
# 基本語法
singularity exec --bind <主機路徑>:<容器路徑> <映像檔> <指令>

# 範例：掛載資料目錄
singularity exec --bind /data:/data pytorch.sif python train.py

# 掛載多個目錄
singularity exec \
    --bind /data:/data \
    --bind /scratch:/scratch \
    pytorch.sif python train.py

# 簡寫形式
singularity exec -B /data:/data,/scratch:/scratch pytorch.sif python train.py
```

預設情況下，Singularity 會自動掛載：
- 當前工作目錄
- 使用者的家目錄
- `/tmp` 目錄

#### 環境變數

設定容器內的環境變數：

```bash
# 使用 --env 選項
singularity exec --env CUDA_VISIBLE_DEVICES=0 pytorch.sif python train.py

# 使用 --env-file 從檔案讀取
singularity exec --env-file env.txt pytorch.sif python train.py

# 或直接在指令前設定
CUDA_VISIBLE_DEVICES=0 singularity exec pytorch.sif python train.py
```

#### 覆寫工作目錄

使用 `--pwd` 設定容器內的工作目錄：

```bash
singularity exec --pwd /app pytorch.sif python train.py
```

#### 使用特定的暫存目錄

```bash
# 設定暫存目錄
singularity exec --scratch /scratch/user pytorch.sif python train.py
```

### Singularity 完整範例

#### 範例 1：基本訓練任務

```bash
# 執行深度學習訓練
singularity exec --nv \
    --bind /data/dataset:/data \
    --bind /results:/output \
    --env OMP_NUM_THREADS=4 \
    pytorch.sif python train.py \
        --data /data \
        --output /output \
        --epochs 100
```

#### 範例 2：互動式開發

```bash
# 使用 srun 在計算節點上啟動互動式容器
srun -p gpu --gres=gpu:1 -c 8 --mem=32G --pty \
    singularity shell --nv \
    --bind /data:/data \
    pytorch.sif
```

#### 範例 3：Slurm 批次工作

```bash
#!/bin/bash
#SBATCH -J container_job
#SBATCH -p gpu
#SBATCH --gres=gpu:1
#SBATCH -c 8
#SBATCH --mem=32G
#SBATCH -t 24:00:00
#SBATCH -o logs/output_%j.txt
#SBATCH -e logs/error_%j.txt

# 設定變數
CONTAINER="/path/to/pytorch.sif"
DATA_DIR="/data/dataset"
OUTPUT_DIR="/results/${SLURM_JOB_ID}"

# 建立輸出目錄
mkdir -p ${OUTPUT_DIR}

# 執行訓練
singularity exec --nv \
    --bind ${DATA_DIR}:/data \
    --bind ${OUTPUT_DIR}:/output \
    ${CONTAINER} python train.py \
        --data /data \
        --output /output \
        --epochs 100 \
        --batch-size 64

echo "Job completed at $(date)"
```

## Enroot 執行方式

Enroot 是 NVIDIA 開發的容器工具，特別適合與 Slurm 整合使用，提供更快的啟動速度。

### Enroot 基本概念

Enroot 使用「容器映像」和「容器實例」的概念：
- **映像（Image）**：從 Docker Hub 或檔案匯入的容器映像
- **容器（Container）**：從映像建立的可執行實例

### 映像管理

#### 匯入映像

```bash
# 從 Docker Hub 匯入
enroot import docker://nvcr.io/nvidia/pytorch:23.12-py3

# 會產生 nvidia+pytorch+23.12-py3.sqsh 檔案
```

#### 列出已匯入的映像

```bash
enroot list
```

#### 刪除映像

```bash
enroot remove nvidia+pytorch+23.12-py3.sqsh
```

### 建立和執行容器

#### 基本執行

```bash
# 直接從映像執行指令
enroot start \
    --root \
    --rw \
    nvidia+pytorch+23.12-py3.sqsh \
    python --version
```

#### 建立持久化容器

建立可重複使用的容器實例：

```bash
# 從映像建立容器
enroot create --name pytorch-container nvidia+pytorch+23.12-py3.sqsh

# 啟動並執行指令
enroot start pytorch-container python train.py

# 列出所有容器
enroot list

# 刪除容器
enroot remove pytorch-container
```

### Enroot 常用選項

#### 掛載目錄

```bash
# 使用 --mount 掛載目錄
enroot start \
    --mount /data:/data \
    --mount /results:/output \
    pytorch-container python train.py
```

#### 環境變數

```bash
# 使用 --env 設定環境變數
enroot start \
    --env CUDA_VISIBLE_DEVICES=0 \
    --env OMP_NUM_THREADS=4 \
    pytorch-container python train.py
```

#### 可寫入模式

```bash
# 使用 --rw 讓容器可寫入
enroot start --rw pytorch-container python train.py
```

### Enroot 與 Slurm 整合

Enroot 特別設計用於與 Slurm 整合，透過 `pyxis` 外掛可以更方便地使用。

#### 使用 srun 直接執行容器

```bash
# 使用 --container-image 指定映像
srun --container-image=nvcr.io/nvidia/pytorch:23.12-py3 \
     python train.py

# 使用已匯入的映像
srun --container-image=./nvidia+pytorch+23.12-py3.sqsh \
     python train.py
```

#### 掛載目錄

```bash
srun --container-image=nvcr.io/nvidia/pytorch:23.12-py3 \
     --container-mounts=/data:/data,/results:/output \
     python train.py --data /data --output /output
```

#### Slurm 批次工作範例

```bash
#!/bin/bash
#SBATCH -J enroot_job
#SBATCH -p gpu
#SBATCH --gres=gpu:1
#SBATCH -c 8
#SBATCH --mem=32G
#SBATCH -t 24:00:00
#SBATCH -o logs/output_%j.txt
#SBATCH -e logs/error_%j.txt

# 使用 Enroot 執行容器
srun --container-image=nvcr.io/nvidia/pytorch:23.12-py3 \
     --container-mounts=/data:/data,/results/${SLURM_JOB_ID}:/output \
     python train.py \
         --data /data \
         --output /output \
         --epochs 100 \
         --batch-size 64
```

### Enroot 進階功能

#### 容器內安裝套件

使用可寫入模式在容器內安裝額外套件：

```bash
# 建立可寫入的容器
enroot create --name pytorch-dev nvidia+pytorch+23.12-py3.sqsh

# 以可寫入模式啟動
enroot start --rw pytorch-dev bash

# 在容器內安裝套件
pip install additional-package

# 離開容器後，變更會被保留
```

#### 容器快照

```bash
# 將修改過的容器匯出為新映像
enroot export -o pytorch-custom.sqsh pytorch-dev
```

## 選擇使用 Singularity 或 Enroot

### 使用 Singularity 的情境

- 需要可攜性，在不同系統間移動映像檔
- 習慣使用單一 .sif 檔案
- 不需要頻繁建立和刪除容器
- 簡單的一次性任務

### 使用 Enroot 的情境

- 大量重複執行相同的容器
- 需要與 Slurm 深度整合
- 需要更快的啟動速度
- 需要在容器內進行開發和修改

## 常見使用模式

### 資料科學工作流程

```bash
# 1. 資料預處理（Singularity）
singularity exec --bind /data:/data \
    pytorch.sif python preprocess.py

# 2. 模型訓練（Enroot + Slurm）
srun --container-image=pytorch.sqsh \
     --container-mounts=/data:/data \
     python train.py

# 3. 模型評估（Singularity）
singularity exec --bind /data:/data,/models:/models \
    pytorch.sif python evaluate.py
```

### 多 GPU 訓練

#### Singularity 版本

```bash
#!/bin/bash
#SBATCH -p gpu
#SBATCH --gres=gpu:4
#SBATCH -c 32

singularity exec --nv pytorch.sif \
    python -m torch.distributed.launch \
    --nproc_per_node=4 \
    train.py
```

#### Enroot 版本

```bash
#!/bin/bash
#SBATCH -p gpu
#SBATCH --gres=gpu:4
#SBATCH -c 32

srun --container-image=pytorch.sqsh \
     python -m torch.distributed.launch \
     --nproc_per_node=4 \
     train.py
```

### 參數掃描（陣列工作）

```bash
#!/bin/bash
#SBATCH -p gpu
#SBATCH --gres=gpu:1
#SBATCH --array=1-10

# 使用陣列 ID 作為參數
LEARNING_RATE=$(awk "NR==${SLURM_ARRAY_TASK_ID}" learning_rates.txt)

singularity exec --nv pytorch.sif \
    python train.py --lr ${LEARNING_RATE}
```

## 效能最佳化建議

### 1. 減少檔案 I/O

```bash
# 將資料複製到本機暫存目錄
cp -r /data/dataset ${TMPDIR}/
singularity exec --bind ${TMPDIR}:/data pytorch.sif python train.py
```

### 2. 使用正確的 CPU 和記憶體設定

```bash
# 設定 OpenMP 執行緒數量
export OMP_NUM_THREADS=${SLURM_CPUS_PER_TASK}
singularity exec pytorch.sif python train.py
```

### 3. GPU 記憶體管理

```bash
# 限制 TensorFlow GPU 記憶體成長
singularity exec --nv \
    --env TF_FORCE_GPU_ALLOW_GROWTH=true \
    tensorflow.sif python train.py
```

## 常見問題

**Q: Singularity 和 Enroot 可以混用嗎？**

A: 可以，但需要注意映像檔格式不同。Singularity 使用 .sif，Enroot 使用 .sqsh。可以透過各自的工具從 Docker 映像轉換。

**Q: 容器內看不到 GPU 怎麼辦？**

A:
- Singularity：確認使用 `--nv` 參數
- Enroot/srun：自動支援 GPU，檢查 Slurm 的 `--gres` 設定

**Q: 如何在容器內使用主機的檔案？**

A:
- Singularity：使用 `--bind` 掛載目錄
- Enroot：使用 `--mount` 或 srun 的 `--container-mounts`

**Q: 容器啟動很慢怎麼辦？**

A:
- 確認映像檔存放在快速的儲存系統上
- 考慮使用 Enroot，啟動速度通常較快
- 避免在網路檔案系統上執行

**Q: 可以在容器內安裝額外的套件嗎？**

A:
- Singularity：容器是唯讀的，但可以使用 `pip install --user`
- Enroot：可以使用 `--rw` 模式修改容器

**Q: 如何除錯容器內的問題？**

A:
1. 使用 shell 模式進入容器
2. 檢查環境變數和路徑設定
3. 確認掛載的目錄是否正確
4. 查看容器的輸出和錯誤訊息

## 最佳實踐總結

1. **選擇合適的工具**：簡單任務用 Singularity，大規模運算用 Enroot
2. **妥善管理映像檔**：定期更新和清理不需要的映像
3. **正確設定資源**：CPU、記憶體、GPU 根據實際需求設定
4. **使用綁定掛載**：避免複製大量資料到容器內
5. **環境變數管理**：將常用設定寫成腳本或配置檔
6. **記錄和監控**：保存執行記錄，監控資源使用情況

## 相關資源

- [Singularity 官方文件](https://docs.sylabs.io/)
- [Enroot 官方文件](https://github.com/NVIDIA/enroot)
- [Pyxis (Slurm + Enroot)](https://github.com/NVIDIA/pyxis)
- [容器最佳實踐指南](https://docs.nvidia.com/ngc/)