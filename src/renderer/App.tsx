import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { Alert, Box, Button, TextField, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import './App.css';
import { testdata } from './testdata';

const COLUMN = [
  {
    headerName: '이미지',
    field: 'image.productImage',
    valueGetter: (params: any) => params.row.image.productImage,
    renderCell: (params: any) => (
      <img src={params.row.image.productImage} alt="" height={50} />
    ),
    width: 60,
  },
  {
    headerName: '제목',
    field: 'information.title',
    valueGetter: (params: any) => params.row.information.title,
    flex: 2,
  },
  {
    headerName: '가격',
    field: 'tradePrice.price',
    valueGetter: (params: any) => params.row.tradePrice.price,

    flex: 1,
  },
  {
    headerName: '최소수량',
    field: 'tradePrice.minOrder',
    valueGetter: (params: any) => params.row.tradePrice.minOrder,

    flex: 1,
  },
  {
    headerName: '제조사',
    field: 'supplier',
    valueGetter: (params: any) => params.row.supplier.supplierName,
    flex: 2,
    // editable: true,
    renderCell: (params: any) => (
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <img
          src={params.row.supplier.companyLogo}
          alt=""
          height={30}
          style={{ marginRight: '5px' }}
        />
        <a href={params.row.supplier.supplierHomeHref} target="_blank">
          {params.row.supplier.supplierName}
        </a>
        ({params.row.supplier.supplierCountry.name})
      </Box>
    ),
  },
  {
    headerName: '샵으로 이동',
    field: 'information.productUrl',
    valueGetter: (params: any) => params.row.information.productUrl,

    flex: 1,
    renderCell: (params: any) => (
      <a href={params.row.information.productUrl} target="_blank">
        제품 보기
      </a>
    ),
  },
];

function Hello() {
  const [file, setFile] = useState<File | null>({});
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [list, setList] = useState<string[]>([]);
  const [result, setResult] = useState<string[][]>({
    resultList: [],
    totalCount: 0,
    currency: 'USD',
    language: 'ko',
  });

  useEffect(() => {
    window.electron.ipcRenderer.once('search-image', (arg) => {
      // eslint-disable-next-line no-console
      setList(arg?.resultList);
      setResult(arg);
      console.log(arg);
      setLoading(false);
    });
  }, []);
  return (
    <Box>
      <Box>
        <input
          type="file"
          onChange={(e) => {
            const newFile = e.target.files?.[0];
            if (newFile) {
              setFile(newFile);
            }
          }}
        />
      </Box>
      {/* <Box>
        <TextField
          placeholder="키워드 입력하세요 | 로 구분됩니다. "
          fullWidth
          size="small"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
          }}
        />
      </Box> */}
      <Box>
        <LoadingButton
          variant="contained"
          loading={loading}
          disabled={!!!file?.path}
          onClick={() => {
            setLoading(true);
            window.electron.ipcRenderer.sendMessage('search-image', {
              file: {
                path: file?.path,
                name: file?.name,
              },
            });
          }}
        >
          search
        </LoadingButton>

        {/* <LoadingButton
          variant="contained"
          loading={loading}
          disabled={!!!result?.resultList}
          onClick={() => {
            setLoading(true);

            const newList = result?.resultList;
            const searchText = text.split('|');

            const filterList = newList?.filter((item) => {
              const title = item?.information?.title;

              const searchResult = searchText.map((search) => {
                return title.includes(search);
              });

              return searchResult.includes(true);
            });

            setList(filterList);

            setLoading(false);
          }}
        >
          키워드 검색
        </LoadingButton> */}
        {loading && <div>검색 중입니다. 좀 걸려요~</div>}
      </Box>

      <Box>
        {list?.length > 0 ? (
          <Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: 3,
                padding: 1,
              }}
            >
              <Box>총 결과수 : {result?.totalCount}</Box>
              <Box>언어 : {result?.language}</Box>
              <Box>화폐 : {result?.currency}</Box>
            </Box>

            <DataGrid rows={list} columns={COLUMN} rowHeight={60} />
          </Box>
        ) : (
          <Box severity="error">검색해주세용.</Box>
        )}
      </Box>
    </Box>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
