import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";

const thumbsContainer = {
	display: "flex",
	flexDirection: "row",
	flexWrap: "wrap",
	marginTop: 16,
};

const thumb = {
	display: "inline-flex",
	borderRadius: 2,
	border: "1px solid #eaeaea",
	marginBottom: 8,
	marginRight: 8,
	width: "auto",
	height: 400,
	padding: 4,
	boxSizing: "border-box",
};

const thumbInner = {
	display: "flex",
	minWidth: 0,
	overflow: "hidden",
};

const img = {
	display: "block",
	width: "auto",
	height: "auto",
};

const baseStyle = {
	flex: 1,
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	padding: "20px",
	borderWidth: 2,
	borderRadius: 2,
	borderColor: "#eeeeee",
	borderStyle: "dashed",
	backgroundColor: "#fafafa",
	color: "#bdbdbd",
	outline: "none",
	transition: "border .24s ease-in-out",
};

const activeStyle = {
	borderColor: "#2196f3",
};

const acceptStyle = {
	borderColor: "#00e676",
};

const rejectStyle = {
	borderColor: "#ff1744",
};

const outputStyle = {
	display: "grid",
	gridColumn: 1,
	gridRow: 2,
};

function Previews(props) {
	const [files, setFiles] = useState([]);
	const [image, setImage] = useState([]);
	const [fileObjs, setFileObjs] = useState([]);

	const {
		getRootProps,
		getInputProps,
		isDragActive,
		isDragAccept,
		isDragReject,
	} = useDropzone({
		multiple: true,
		accept: "image/*",
		onDrop: acceptedFiles => {
			setFiles(
				acceptedFiles.map(file =>
					Object.assign(file, {
						preview: URL.createObjectURL(file),
					})
				)
			);
			setFileObjs(acceptedFiles);
		},
	});

	const style = React.useMemo(
		() => ({
			...baseStyle,
			...(isDragActive ? activeStyle : {}),
			...(isDragAccept ? acceptStyle : {}),
			...(isDragReject ? rejectStyle : {}),
		}),
		[isDragActive, isDragReject, isDragAccept]
	);

	const thumbs = files.map(file => (
		<div style={thumb} key={file.name}>
			<div style={thumbInner}>
				<img alt="selected" src={file.preview} style={img} />
			</div>
		</div>
	));

	useEffect(
		() => () => {
			// Make sure to revoke the data uris to avoid memory leaks
			files.forEach(file => URL.revokeObjectURL(file.preview));
		},
		[files]
	);

	const onClick = async event => {
		event.preventDefault();

		const bodyFormData = new FormData();
		fileObjs.forEach(x => {
			bodyFormData.append("images", x);
		});

		const test = await axios({
			method: "post",
			url: `http://localhost:5000/api/upload`,
			data: bodyFormData,
			headers: { "Content-Type": "multipart/form-data" },
		});
		setImage(test.data.urls);
		console.log(test);
	};

	return (
		<section className="container">
			<div {...getRootProps({ className: "dropzone", style })}>
				<input {...getInputProps()} />
				{isDragActive ? (
					<p>Drop the files here ...</p>
				) : (
					<p>
						Drag 'n' drop some files here, or click to select files
					</p>
				)}
			</div>

			<div style={outputStyle}>
				<h3>Before</h3>
				<aside style={thumbsContainer}>{thumbs}</aside>
				<button onClick={onClick}>Submit</button>

				<div>
					<h3>After</h3>
					{image.map((x, i) => (
						<img
							key={x}
							src={x}
							alt="result"
							onClick={e => {
								const splitted = x.split("/");
								const filename = splitted[splitted.length - 1];
								const a = document.createElement("a");
								fetch(x)
									.then(x => x.blob())
									.then(b => {
										a.href = URL.createObjectURL(b);
										a.download = filename;
										a.click();
										URL.revokeObjectURL(b);
									});
							}}
						/>
					))}
				</div>
			</div>
		</section>
	);
}

export default function App() {
	return <Previews />;
}
