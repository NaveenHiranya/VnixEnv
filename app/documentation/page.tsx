import Link from "next/link";
import Image from "next/image";
import warning from "@/public/documentation/mark.png";
export default function doc() {
  return (
    <div className="text-white flex items-center flex-col">
      <div className="bg-neutral-900 flex justify-center p-4 text-xl font-bold w-full">
        <p className="max-w-3xl w-full">ALoha</p>
      </div>
      <div className="p-2 max-w-3xl">
        <p className="text-base leading-8 space-y-6 mt-2 text-justify">
          The purpose of this application is to help users create web
          applications and websites using AI. Unlike other platforms, we provide
          a safer development environment where users can confidently build
          their projects. Our platform uses large language models (LLMs) to
          generate applications while also providing essential services such as
          database integration, hosting, and payment gateway support. This
          enables users to build and deploy AI-generated applications with
          reduced risk, ensuring a more secure and reliable development
          experience.
        </p>
        <div className="border-purple-500 border-2 bg-purple-900 font-bold p-4 my-4 rounded-2xl">
          <Link href="./CreateApp2">Create App</Link>
        </div>
        <div className="max-w-3xl mx-auto text-base leading-8 space-y-6 text-justify">
          <p>
            The application uses three main stages powered by large language
            models (LLMs) to generate a complete web application.
          </p>

          <p className="">
            First, the user enters a prompt describing the application they want
            to build. This prompt is sent to the first LLM, which acts as a
            Business Analyst. It analyzes the user's requirements and converts
            them into a clear, structured software specification. The generated
            specification is then presented to the user, who can review and edit
            it before continuing.
          </p>

          <p>
            Once the user confirms the specification, it is sent to the second
            LLM. This model works as a Software Architect, transforming the
            requirements into a detailed development plan. It defines the
            application's features, functionality, color palette, UI components,
            page structure, and folder organization, creating a blueprint for
            the project.
          </p>

          <p>
            Finally, the structured blueprint is passed to the third LLM, which
            acts as the Code Generator. Using the architectural plan, it
            generates the complete web application using HTML, CSS, and
            JavaScript. This multi-stage workflow improves the accuracy and
            quality of the generated application by separating requirement
            analysis, system design, and code generation into dedicated AI
            models.
          </p>
          <p>
            After the application is developed, it can be stored for the user
            and displayed on the home screen as a draft.
          </p>
          <p className="border rounded-2xl p-3">Process explain:</p>
          <p>
            After Enter the prompt in input field.it sends user input to{" "}
            <span className="text-red-500"> sendMessage() </span> function. then
            this function send prompt to{" "}
            <span className="text-green-500">"/api/createapp/analyst"</span> and
            get return from it. if it is related to development process this
            functionality continue the process using{" "}
            <span className="text-red-500">setAppData(app);</span> variable
            render a form to help to user what is going to build. In this
            process user can add, remove and change features using this form.
            after submit the form it returns to{" "}
            <span className="text-red-500">handleSubmit() </span>function and
            this function send prompt to{" "}
            <span className="text-red-500">appGenerator(prompt); </span>
            function. This function send prompt to{" "}
            <span className="text-green-500">"/api/createapp/features"</span>
            and it checks agin is this application{" "}
            <span className="text-blue-500"> isWebApplication </span>
            if it is related to web applcation it sends prompt to{" "}
            <span className="text-red-500">codeGenerator(data) </span>
            fuction and this function send appGenerator functions output to{" "}
            <span className="text-green-500">"/api/createapp/creator" </span>
            and after this output using{" "}
            <span className="text-red-500">setGeneratedCode(html) </span>{" "}
            variable render the created application
          </p>
          <p className="text-xl text-green-500">"/api/createapp/analyst"</p>
          <p>
            const DEFAULT_RESPONSE = <br></br>
            isDev: false,<br></br>
            appName: "",<br></br>
            appDescription:<br></br>
            "I can help only with HTML, CSS, and JavaScript web application
            development.", features: [],<br></br>
            pages: [],<br></br>
            components: [],<br></br>
            uiSuggestions: [],<br></br>
            technicalNotes: [],<br></br>
          </p>
          <div className="flex items-center gap-1 font-bold p-4 my-4 rounded-2xl">
            <Image src={warning} alt="warning" width={35}></Image>
            <p>Under Development process</p>
          </div>
          <div className="border-purple-500 border-2 bg-purple-900 font-bold p-4 my-4 rounded-2xl">
            <Link href="./home">Home</Link>
          </div>
          <div className="max-w-3xl mx-auto text-base leading-8 space-y-6 text-justify">
            <p>
              The home screen displays drafts, installed applications,
              recommended apps, and system applications for easy access and
              navigation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
