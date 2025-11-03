# 基本操作說明

## Linux 基本指令

### 檔案與目錄操作

#### 查看目錄內容
```bash
ls              # 列出當前目錄的檔案
ls -l           # 詳細列出檔案資訊（權限、大小、修改時間等）
ls -a           # 顯示所有檔案（包含隱藏檔案）
ls -lh          # 以人類可讀的方式顯示檔案大小（KB, MB, GB）
```

#### 切換目錄
```bash
cd /path/to/dir    # 移動到指定目錄
cd ~               # 移動到家目錄
cd ..              # 移動到上一層目錄
cd -               # 移動到前一個目錄
pwd                # 顯示目前所在的完整路徑
```

#### 建立與刪除
```bash
mkdir dirname         # 建立新目錄
mkdir -p dir1/dir2    # 建立多層目錄
rm filename           # 刪除檔案
rm -r dirname         # 刪除目錄及其內容
rm -rf dirname        # 強制刪除目錄（不詢問，請謹慎使用）
```

#### 複製與移動
```bash
cp file1 file2        # 複製檔案
cp -r dir1 dir2       # 複製整個目錄
mv file1 file2        # 移動或重新命名檔案
mv file1 /path/to/    # 移動檔案到指定目錄
```

### 檔案內容檢視

```bash
cat filename          # 顯示整個檔案內容
head filename         # 顯示檔案前 10 行
head -n 20 filename   # 顯示檔案前 20 行
tail filename         # 顯示檔案最後 10 行
tail -f filename      # 持續顯示檔案新增的內容（常用於查看 log）
less filename         # 分頁顯示檔案（可上下捲動，按 q 離開）
```

### 檔案搜尋

```bash
find /path -name "*.txt"     # 在指定路徑搜尋所有 .txt 檔案
grep "keyword" filename      # 在檔案中搜尋包含關鍵字的行
grep -r "keyword" /path      # 在目錄中遞迴搜尋關鍵字
```

### 檔案權限

```bash
chmod 755 filename    # 修改檔案權限（7=rwx, 5=r-x）
chmod +x script.sh    # 讓檔案變成可執行
chown user:group file # 修改檔案擁有者
```

### 系統資源查看

```bash
df -h                 # 查看磁碟空間使用情況
du -sh dirname        # 查看目錄大小
top                   # 即時顯示系統資源使用狀況（按 q 離開）
htop                  # 更友善的系統監控工具（如果有安裝）
```

## Slurm 基本操作

Slurm 是高效能運算叢集的工作排程系統，用於管理和分配運算資源。

### 查看叢集狀態

#### 查看節點資訊
```bash
sinfo                 # 顯示所有節點的狀態
sinfo -N              # 以節點為單位顯示
sinfo -l              # 顯示詳細資訊
```

節點狀態說明：
- `idle`: 節點閒置，可接受新工作
- `alloc`: 節點已被完全分配
- `mix`: 節點部分資源被使用
- `down`: 節點離線

#### 查看佇列（partition）資訊
```bash
sinfo -s              # 簡要顯示各佇列狀態
squeue                # 查看目前所有排隊和執行中的工作
squeue -u username    # 查看特定使用者的工作
```

### 提交工作

#### 互動式工作
適合需要即時互動或測試的情況：
```bash
srun -p partition_name -N 1 -n 4 --pty bash
```
參數說明：
- `-p`: 指定佇列名稱
- `-N`: 需要的節點數量
- `-n`: 需要的 CPU 核心數
- `--pty bash`: 啟動互動式 shell

#### 批次工作
適合長時間執行的運算任務：

建立工作腳本 `job.sh`：
```bash
#!/bin/bash
#SBATCH -J job_name           # 工作名稱
#SBATCH -p partition_name     # 佇列名稱
#SBATCH -N 1                  # 需要 1 個節點
#SBATCH -n 4                  # 需要 4 個 CPU 核心
#SBATCH -t 24:00:00           # 最長執行時間（24 小時）
#SBATCH -o output_%j.txt      # 標準輸出檔案（%j 會被工作 ID 取代）
#SBATCH -e error_%j.txt       # 錯誤輸出檔案

# 載入需要的模組
module load gcc
module load python

# 執行你的程式
python your_script.py
```

提交工作：
```bash
sbatch job.sh
```

### 管理工作

#### 查看工作狀態
```bash
squeue -j job_id      # 查看特定工作的狀態
scontrol show job job_id    # 顯示工作的詳細資訊
```

工作狀態說明：
- `PD` (Pending): 等待中
- `R` (Running): 執行中
- `CG` (Completing): 即將完成
- `CD` (Completed): 已完成
- `F` (Failed): 失敗
- `CA` (Cancelled): 已取消

#### 取消工作
```bash
scancel job_id        # 取消特定工作
scancel -u username   # 取消該使用者的所有工作
scancel -n job_name   # 取消特定名稱的工作
```

#### 查看工作歷史
```bash
sacct                           # 查看最近的工作記錄
sacct -j job_id                 # 查看特定工作的記錄
sacct -S 2024-01-01             # 查看指定日期後的工作記錄
sacct --format=JobID,JobName,State,Elapsed,MaxRSS    # 自訂顯示欄位
```

### 常用參數組合範例

#### GPU 運算工作
```bash
#!/bin/bash
#SBATCH -J gpu_job
#SBATCH -p gpu_partition
#SBATCH --gres=gpu:1          # 需要 1 張 GPU
#SBATCH -c 4                  # 需要 4 個 CPU 核心
#SBATCH -t 12:00:00
#SBATCH -o output_%j.txt

nvidia-smi                     # 檢查 GPU 狀態
python train_model.py
```

#### 記憶體密集型工作
```bash
#!/bin/bash
#SBATCH -J memory_job
#SBATCH -p normal
#SBATCH --mem=32G             # 需要 32GB 記憶體
#SBATCH -c 8
#SBATCH -t 48:00:00

your_program
```

#### 陣列工作（批次處理多個類似任務）
```bash
#!/bin/bash
#SBATCH -J array_job
#SBATCH -p normal
#SBATCH --array=1-10          # 同時執行 10 個任務
#SBATCH -c 2
#SBATCH -t 2:00:00

# SLURM_ARRAY_TASK_ID 會是 1 到 10
python process.py --input file_${SLURM_ARRAY_TASK_ID}.txt
```

### 實用技巧

#### 檢查工作預估開始時間
```bash
squeue -j job_id --start
```

#### 查看可用資源
```bash
sinfo -o "%20P %5a %10l %6D %6t %N"
```

#### 監控執行中的工作
```bash
# 查看工作的輸出檔案
tail -f output_job_id.txt

# 登入執行工作的節點（如果允許）
squeue -j job_id -o "%N"     # 先找出節點名稱
ssh node_name                # 登入該節點
```

### 模組管理

許多 HPC 系統使用 module 來管理軟體環境：

```bash
module avail              # 列出所有可用的模組
module list               # 顯示已載入的模組
module load module_name   # 載入特定模組
module unload module_name # 卸載模組
module purge              # 卸載所有模組
module spider software    # 搜尋特定軟體
```

### 注意事項

1. **不要在登入節點執行運算任務**：登入節點是共用資源，應該只用於編輯檔案、提交工作等輕量操作
2. **合理估計資源需求**：申請過多資源會延長等待時間，申請不足則可能導致工作失敗
3. **設定合理的時間限制**：確保工作能在時限內完成，但不要設定過長的時間
4. **定期清理檔案**：工作產生的暫存檔和輸出檔案應定期刪除，避免佔用過多空間
5. **備份重要資料**：工作目錄通常不會自動備份，重要資料請另行備份