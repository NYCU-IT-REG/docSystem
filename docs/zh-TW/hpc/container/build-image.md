# 製作映像檔

本章節說明如何製作自訂的 Singularity 容器映像檔。當現有的容器映像檔無法滿足需求時，你可以建立專屬的容器環境。

## 映像檔製作方式

Singularity 提供多種方式來製作容器映像檔：

1. **從 Docker Hub 轉換**：將現有的 Docker 映像檔轉換為 Singularity 格式
2. **使用 Definition File**：透過腳本定義容器環境（推薦）
3. **從 Sandbox 建立**：在可寫入的目錄中建立後轉換

## 從 Docker Hub 轉換

最簡單的方式是將 Docker 映像檔轉換為 Singularity 格式（.sif 檔案）。

### 基本用法

```bash
# 語法
singularity pull docker://repository/image:tag

# 範例：下載 Ubuntu 22.04
singularity pull docker://ubuntu:22.04

# 會產生 ubuntu_22.04.sif 檔案
```

### 指定輸出檔名

```bash
# 自訂輸出檔名
singularity pull my-ubuntu.sif docker://ubuntu:22.04
```

### 常用的基礎映像檔

```bash
# Ubuntu
singularity pull docker://ubuntu:22.04

# Python
singularity pull docker://python:3.11

# Conda
singularity pull docker://continuumio/miniconda3

# NVIDIA CUDA
singularity pull docker://nvidia/cuda:12.0.0-base-ubuntu22.04
```

## 使用 Definition File

Definition File 是建立自訂容器的推薦方式，類似於 Docker 的 Dockerfile。

### Definition File 結構

Definition File 包含多個區段（Section），每個區段定義容器的不同部分：

```singularity
Bootstrap: docker
From: ubuntu:22.04

%post
    # 在這裡執行安裝指令

%environment
    # 設定環境變數

%runscript
    # 定義容器預設執行的指令

%labels
    # 定義容器的標籤資訊

%help
    # 定義容器的說明文件
```

### 基本範例

建立一個包含 Python 和常用科學運算套件的容器：

```singularity
Bootstrap: docker
From: ubuntu:22.04

%post
    # 更新套件清單
    apt-get update

    # 安裝基本工具
    apt-get install -y wget git vim

    # 安裝 Python 和 pip
    apt-get install -y python3 python3-pip

    # 安裝 Python 套件
    pip3 install numpy pandas matplotlib scikit-learn

    # 清理
    apt-get clean
    rm -rf /var/lib/apt/lists/*

%environment
    # 設定 Python 相關環境變數
    export LC_ALL=C.UTF-8
    export LANG=C.UTF-8

%runscript
    # 預設執行 Python
    exec python3 "$@"

%labels
    Author your.email@example.com
    Version v1.0

%help
    這是一個包含 Python 3 和常用科學運算套件的容器。

    使用方式：
        singularity exec container.sif python3 script.py
```

### 建立映像檔

```bash
# 使用 definition file 建立映像檔
# 注意：需要 root 權限或使用 --fakeroot
singularity build my-python.sif my-python.def

# 使用 fakeroot 建立（不需要 root 權限）
singularity build --fakeroot my-python.sif my-python.def
```

## Definition File 各區段詳解

### Bootstrap 和 From

指定基礎映像檔的來源：

```singularity
# 從 Docker Hub
Bootstrap: docker
From: ubuntu:22.04

# 從其他 Singularity 映像檔
Bootstrap: localimage
From: /path/to/existing.sif

# 從空白開始（進階用法）
Bootstrap: debootstrap
OSVersion: focal
MirrorURL: http://us.archive.ubuntu.com/ubuntu/
```

### %files

從主機複製檔案到容器中：

```singularity
%files
    ./config.txt /opt/config.txt
    ./data/* /data/
    requirements.txt /tmp/requirements.txt
```

### %post

在容器中執行安裝和設定指令：

```singularity
%post
    # 設定時區
    export DEBIAN_FRONTEND=noninteractive
    apt-get update
    apt-get install -y tzdata
    ln -fs /usr/share/zoneinfo/Asia/Taipei /etc/localtime

    # 安裝編譯工具
    apt-get install -y build-essential cmake

    # 從原始碼編譯安裝軟體
    cd /tmp
    wget https://example.com/software.tar.gz
    tar xzf software.tar.gz
    cd software
    ./configure --prefix=/usr/local
    make -j4
    make install

    # 使用 pip 安裝 Python 套件
    pip3 install -r /tmp/requirements.txt
```

### %environment

設定容器執行時的環境變數：

```singularity
%environment
    # 設定 PATH
    export PATH=/opt/software/bin:$PATH

    # 設定函式庫路徑
    export LD_LIBRARY_PATH=/opt/software/lib:$LD_LIBRARY_PATH

    # 設定應用程式特定變數
    export APP_HOME=/opt/app
    export APP_CONFIG=/opt/app/config.ini
```

### %runscript

定義使用 `singularity run` 執行容器時的預設行為：

```singularity
%runscript
    echo "執行分析程式..."
    exec python3 /opt/app/main.py "$@"
```

### %startscript

定義容器作為服務執行時的啟動腳本：

```singularity
%startscript
    # 啟動 web 伺服器
    exec python3 -m http.server 8080
```

### %test

定義容器的測試指令，在建立後自動執行：

```singularity
%test
    # 測試 Python 是否正確安裝
    python3 --version

    # 測試套件是否可用
    python3 -c "import numpy; print(numpy.__version__)"
    python3 -c "import pandas; print(pandas.__version__)"
```

### %labels

新增容器的元資料標籤：

```singularity
%labels
    Author John Doe
    Email john.doe@example.com
    Version 1.0.0
    Description Python科學運算環境
    BuildDate 2024-01-15
```

### %help

提供容器的使用說明：

```singularity
%help
    Python 科學運算容器

    包含的套件：
    - NumPy
    - Pandas
    - Matplotlib
    - Scikit-learn

    使用範例：
        # 執行 Python 腳本
        singularity exec container.sif python3 script.py

        # 進入互動式 Python
        singularity exec container.sif python3

        # 使用預設的 runscript
        singularity run container.sif
```

## 實際範例

### 範例 1：深度學習環境

```singularity
Bootstrap: docker
From: nvidia/cuda:12.0.0-cudnn8-devel-ubuntu22.04

%post
    # 安裝 Python 和基本工具
    apt-get update
    apt-get install -y python3 python3-pip git wget

    # 安裝深度學習框架
    pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu120
    pip3 install tensorboard

    # 安裝其他常用套件
    pip3 install numpy pandas matplotlib scikit-learn jupyter

    # 清理
    apt-get clean
    rm -rf /var/lib/apt/lists/*

%environment
    export CUDA_HOME=/usr/local/cuda
    export PATH=$CUDA_HOME/bin:$PATH
    export LD_LIBRARY_PATH=$CUDA_HOME/lib64:$LD_LIBRARY_PATH

%runscript
    exec python3 "$@"

%labels
    Author research.team@example.com
    Version 1.0
    Description PyTorch深度學習環境 with CUDA 12.0

%help
    PyTorch 深度學習容器

    包含：
    - CUDA 12.0
    - cuDNN 8
    - PyTorch (with CUDA support)
    - TensorBoard
    - Jupyter

    使用範例：
        singularity exec --nv pytorch.sif python3 train.py
```

### 範例 2：R 統計分析環境

```singularity
Bootstrap: docker
From: rocker/r-ver:4.3.0

%post
    # 安裝系統相依套件
    apt-get update
    apt-get install -y libcurl4-openssl-dev libssl-dev libxml2-dev

    # 安裝 R 套件
    R -e "install.packages(c('tidyverse', 'ggplot2', 'dplyr', 'caret'), repos='https://cloud.r-project.org/')"

    # 清理
    apt-get clean
    rm -rf /var/lib/apt/lists/*

%environment
    export LC_ALL=en_US.UTF-8
    export LANG=en_US.UTF-8

%runscript
    exec R "$@"

%labels
    Author stats.team@example.com
    Version 1.0
    Description R統計分析環境

%help
    R 統計分析容器

    包含常用的 R 套件：
    - tidyverse
    - ggplot2
    - dplyr
    - caret

    使用範例：
        singularity exec r-stats.sif Rscript analysis.R
```

### 範例 3：生物資訊分析環境

```singularity
Bootstrap: docker
From: continuumio/miniconda3:latest

%files
    environment.yml /tmp/environment.yml

%post
    # 更新 conda
    conda update -n base -c defaults conda

    # 從 environment.yml 建立環境
    conda env create -f /tmp/environment.yml

    # 清理
    conda clean --all -y
    rm /tmp/environment.yml

%environment
    # 啟動 conda 環境
    export PATH=/opt/conda/envs/bioinfo/bin:$PATH

%runscript
    exec "$@"

%labels
    Author bioinfo.team@example.com
    Version 1.0
    Description 生物資訊分析環境

%help
    生物資訊分析容器

    包含常用的生物資訊工具（透過 conda 安裝）

    使用範例：
        singularity exec bioinfo.sif samtools --version
```

對應的 `environment.yml`：

```yaml
name: bioinfo
channels:
  - bioconda
  - conda-forge
  - defaults
dependencies:
  - python=3.10
  - samtools
  - bwa
  - bowtie2
  - fastqc
  - multiqc
  - numpy
  - pandas
  - biopython
```

## 使用 Sandbox 建立

Sandbox 是一個可寫入的目錄，方便測試和開發容器：

```bash
# 建立 sandbox
singularity build --sandbox my-container/ docker://ubuntu:22.04

# 以可寫入模式進入容器進行修改
singularity shell --writable my-container/

# 在容器內進行測試和安裝
Singularity> apt-get update
Singularity> apt-get install -y python3
Singularity> exit

# 將 sandbox 轉換為映像檔
singularity build my-container.sif my-container/
```

## 在 HPC 環境中建立映像檔

由於 HPC 的登入節點通常沒有 root 權限，有以下幾種方式：

### 方法 1：使用 --fakeroot

如果系統管理員啟用了 fakeroot 功能：

```bash
singularity build --fakeroot my-image.sif my-definition.def
```

### 方法 2：使用 --remote

透過 Sylabs Cloud 的遠端建立服務：

```bash
# 需要先註冊並登入 Sylabs Cloud
singularity remote login

# 使用遠端建立
singularity build --remote my-image.sif my-definition.def
```

### 方法 3：在本機建立後上傳

在有 root 權限的本機電腦或虛擬機建立映像檔，再上傳到 HPC：

```bash
# 在本機建立
sudo singularity build my-image.sif my-definition.def

# 上傳到 HPC
scp my-image.sif username@hpc.server:/path/to/destination/
```

## 測試映像檔

建立映像檔後，應該進行測試：

```bash
# 檢查映像檔資訊
singularity inspect my-image.sif

# 檢查標籤
singularity inspect --labels my-image.sif

# 檢查說明
singularity run-help my-image.sif

# 測試執行
singularity exec my-image.sif python3 --version

# 互動式測試
singularity shell my-image.sif
```

## 最佳實踐

### 1. 使用版本標籤

明確指定基礎映像檔的版本：

```singularity
# 好的做法
Bootstrap: docker
From: ubuntu:22.04

# 避免使用
Bootstrap: docker
From: ubuntu:latest  # 版本不固定，可能導致重現性問題
```

### 2. 清理暫存檔

在 %post 區段結束時清理不需要的檔案：

```singularity
%post
    apt-get update
    apt-get install -y software

    # 清理
    apt-get clean
    rm -rf /var/lib/apt/lists/*
    rm -rf /tmp/*
```

### 3. 使用環境變數

將可能需要修改的參數設定為環境變數：

```singularity
%environment
    export APP_VERSION=1.0
    export DATA_PATH=/data
    export OUTPUT_PATH=/output
```

### 4. 提供完整的說明

在 %help 區段提供清楚的使用說明：

```singularity
%help
    容器名稱和用途

    包含的軟體版本

    使用範例

    注意事項
```

### 5. 固定套件版本

安裝套件時指定版本，確保可重現性：

```singularity
%post
    # Python 套件指定版本
    pip3 install numpy==1.24.0 pandas==2.0.0

    # APT 套件指定版本
    apt-get install -y python3=3.10.6-1~22.04
```

### 6. 分層建立

對於複雜的環境，可以分層建立：

```bash
# 先建立基礎映像檔
singularity build base.sif base.def

# 再基於基礎映像檔建立特定應用的映像檔
```

```singularity
Bootstrap: localimage
From: base.sif

%post
    # 只安裝應用特定的套件
    pip3 install application-specific-package
```

## 常見問題

**Q: 建立映像檔時出現權限錯誤怎麼辦？**

A: 嘗試使用 `--fakeroot` 參數，或在本機建立後上傳到 HPC。

**Q: 如何在容器中使用 GPU？**

A: 使用包含 CUDA 的基礎映像檔，並在執行時加上 `--nv` 參數。

**Q: 映像檔可以修改嗎？**

A: .sif 檔案是唯讀的。如需修改，需要使用 sandbox 或重新建立映像檔。

**Q: 如何減小映像檔大小？**

A: 清理不需要的檔案、使用較小的基礎映像檔、避免安裝不必要的套件。

**Q: 可以在容器中安裝 conda 嗎？**

A: 可以，建議使用 miniconda 作為基礎映像檔，或在 %post 區段中安裝 conda。

## 相關資源

- [Singularity 官方文件](https://docs.sylabs.io/)
- [Definition File 完整參考](https://docs.sylabs.io/guides/latest/user-guide/definition_files.html)
- [Docker Hub](https://hub.docker.com/) - 尋找基礎映像檔
- [NVIDIA NGC](https://catalog.ngc.nvidia.com/) - GPU 優化的映像檔