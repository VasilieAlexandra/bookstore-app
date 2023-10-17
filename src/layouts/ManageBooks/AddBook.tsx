import Badge from "@mui/material/Badge";
import { AccountSidebar } from "../Account/AccountSidebar";
import { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import { PhotoCamera } from "@mui/icons-material";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import ICategoryData from "../../types/Category";
import CatgeoryService from "../../services/CategoryService";
import IBookData from "../../types/Book";
import BookService from "../../services/BookService";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import { AxiosRequestConfig } from "axios";
import { useAuth } from "../../provider/AuthProvider";
import React  from 'react';


export const AddBook = () => {
    const [image, setImage] = useState({ preview: "", raw: '' as unknown as File });
    const [categoryList, setCategoryList] = useState<Array<ICategoryData>>([]);
    const [bookRequest, setBookRequest] = useState<IBookData>({ name: '', author: '', price: 0, quantity: 0, categories: [] });
    const { token } = useAuth();
    const { user } = useAuth();
    const { getAll } = CatgeoryService;
    const { create } = BookService;
    const [count, setCount] = useState(0);

    const increment = () => {
        setCount(count + 1)
    }

    const isDisabled = () => {
        if (bookRequest.categories.length === 0 || image.preview === '')
            return true;
        return false;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files!.length) {
            setImage({
                preview: URL.createObjectURL(e.target.files![0]),
                raw: e.target.files![0]
            });
        }
    };

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();

        setBookRequest({
            ...bookRequest,
            [e.currentTarget.name]: e.currentTarget.value
        });

    };

    useEffect(() => {
        async function getCategories() {
            const response = await getAll();
            setCategoryList(response.data);

        }
        getCategories();
        setBookRequest({ ...bookRequest, categories: [] })
    }, [count]);


    const handleUpload = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("image", image.raw);
        const res = await image.raw.arrayBuffer();
        console.log(res);

        const options: AxiosRequestConfig = {
            headers: {
                'Authorization': `Bearer ${token}`,
            },

            params: { "book": JSON.stringify(bookRequest), "image": JSON.stringify(image.raw) }
        };

        try {
            const response = await create(user!.uid, formData, options);
            console.log(response.data);
            increment();

        } catch {
            console.log("Failed to add book");
        }

    };

    const handleOnClick = (category: ICategoryData) => {
        setBookRequest({ ...bookRequest, categories: [...bookRequest.categories, category] });
        categoryList.splice(categoryList.indexOf(category), 1);
        setCategoryList(categoryList);
    };

    const handleOnDelete = (category: ICategoryData) => {
        setCategoryList([...categoryList, category]);
        bookRequest.categories.splice(bookRequest.categories.indexOf(category), 1);
        setBookRequest({ ...bookRequest, categories: bookRequest.categories });
    };
    return (
        <>
            <AccountSidebar>

                <div className="d-flex justify-content-between aligne-item-center col m-5" >
                    <form className="d-flex justify-content-between aligne-item-center col me-auto" id="uploadForm" encType="multipart/form-data" onSubmit={handleUpload}>
                        <div className="d-flex justify-content-between aligne-item-center row me-auto" style={{ maxWidth: '500px', minWidth: '500px' }}>

                            <Badge
                                overlap="circular"
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                                badgeContent={
                                    <IconButton color="primary" aria-label="upload picture" component="label">
                                        <input name="image" id="image" hidden type="file" onChange={handleChange} required />
                                        <PhotoCamera />
                                    </IconButton>
                                }
                            >
                                {image.preview &&
                                    <img
                                        className="object-fit-contain"
                                        src={image.preview}
                                        alt="Please upload image"
                                        loading="lazy"
                                        width="400px" height="450px"
                                    />
                                }
                            </Badge>


                            <Grid container spacing={1} justifyContent="flex-start" alignItems="center" >
                                {bookRequest.categories &&
                                    bookRequest.categories.map(category => (

                                        <Grid item xs="auto" key={category.id}>
                                            <Chip label={category.name} onDelete={() => handleOnDelete(category)} color='warning' />
                                        </Grid>

                                    ))}
                            </Grid>
                        </div>

                        <Divider orientation="vertical" className="me-5 ms-5" />

                        <div className="d-flex justify-content-between aligne-items-between row ms-auto">
                            <TextField className="p-2" name="name" id="outlined-basic" defaultValue={bookRequest.name}
                                label="Title" variant="outlined"
                                onChange={handleOnChange} required />

                            <TextField className="p-2" name="author" id="outlined-basic" defaultValue={bookRequest.author}
                                label="Author" variant="outlined"
                                onChange={handleOnChange} required />

                            <TextField className="p-2" name="price" type='number' id="outlined-basic" value={bookRequest.price}
                                label="Price" variant="outlined"
                                onChange={handleOnChange} required
                                inputProps={{
                                    inputMode: 'numeric',
                                    step: '1',
                                    min: "1",
                                }}
                                InputProps={{
                                    endAdornment: <InputAdornment position="start"  >Lei</InputAdornment>
                                }} />

                            <TextField className="p-2" name="quantity" type='number' id="outlined-basic" defaultValue={bookRequest.quantity}
                                label="Quantity" variant="outlined" required
                                onChange={handleOnChange}
                                inputProps={{
                                    inputMode: 'numeric',
                                    min: "1",
                                    step: '1',
                                }}
                            />

                            <Grid className="p-2" container spacing={1} justifyContent="flex-start" alignItems="center" >
                                {categoryList &&
                                    categoryList.map(category => (

                                        <Grid item xs="auto" key={category.id}>
                                            <Chip label={category.name} variant="outlined" onClick={() => handleOnClick(category)} color='warning' />
                                        </Grid>
                                        //    <li className="ms-auto p-2" key={category.id}> ></li>
                                    ))}
                            </Grid>
                            <div className="mt-4">
                                <Button variant="contained" size="small" type="submit" disabled={isDisabled()}>Upload</Button>
                            </div>
                            {/* {error && <Alert className="m-10" variant="danger">{error}</Alert>} */}
                        </div>
                    </form>

                </div>


            </AccountSidebar>
        </>
    );
};

