// 模拟异步并发请求
const fetchData = (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Task ${id} completed`);
      resolve(`Result of task ${id}`);
    }, 1000);
  });
};

const concurRequest = (maxMum, arr) => {
  if (arr.length === 0) return Promise.resolve([]);
  return new Promise((resolve) => {
    let idx = 0;
    // 存储请求结果
    let result = [];
    let count = 0;
    async function _request() {
      const i = idx;
      const id = arr[idx];
      idx++;
      try {
        const resp = await fetchData(id);
        result[i] = resp;
      } catch (e) {
        result[i] = e;
      } finally {
        count++;
        if (count === arr.length) {
          resolve(result);
        }
        if (idx < arr.length) {
          _request();
        }
      }
    }

    for (let i = 0; i < Math.min(maxMum, arr.length); i++) {
      _request();
    }
  });
};

// 任务数组
const tasks = [1, 2, 3, 4, 5];

// 调用 concurRequest，最大并发数为 2
concurRequest(2, tasks)
  .then((results) => {
    console.log("All tasks completed:", results);
  })
  .catch((error) => {
    console.error("Error:", error);
  });
