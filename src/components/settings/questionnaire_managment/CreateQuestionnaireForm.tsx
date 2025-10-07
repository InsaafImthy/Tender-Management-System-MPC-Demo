import React, { useState } from 'react';
import TextField from '../../basic_components/TextField';
import { IModalProps } from '../../../types/commonTypes';
import { IQuestionnaire, IQuestion } from '../../../types/questionnaireTypes';
import { createQuestionnaireAsync, updateQuestionnaireAsync } from '../../../services/questionnaireService';
import { notification } from 'antd';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import SelectField from '../../basic_components/SelectField';
import { questionTypesList } from '../../../utils/constants';

interface FormErrors {
  name?: string;
  questions?: string;
}

interface ICreateQuestionnaireForm extends IModalProps {
  type?: "edit" | "create",
  questionnaire: IQuestionnaire,
  trigger: () => void
}

const CreateQuestionnaireForm: React.FC<ICreateQuestionnaireForm> = ({
  type = "create",
  questionnaire,
  trigger,
  closeModal
}) => {
  const [formData, setFormData] = useState<IQuestionnaire>(
    type === "create"
      ? ({
        questionnaireName: "",
        description: "",
        questionnaireItemDtos: []
      })
      : questionnaire
  );

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<IQuestion>({
    question: "",
    questionType: 0,
    questionHelpText: "",
    isRequired: false,
  });

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questionnaireItemDtos: [...prev.questionnaireItemDtos, { ...currentQuestion, id: Date.now().toString() }]
    }));
    setCurrentQuestion({
      question: "",
      questionType: 0,
      questionHelpText: "",
      isRequired: false,
      questionnaireId: ""
    });
  };

  const removeQuestion = (questionId: string) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questionnaireItemDtos.filter(q => q.id !== questionId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      setIsLoading(true);

      if (!formData.questionnaireName.trim()) {
        setErrors(prev => ({
          ...prev,
          name: "Questionnaire name is required"
        }));
        return;
      }

      if (formData.questionnaireItemDtos.length === 0) {
        setErrors(prev => ({
          ...prev,
          questions: "At least one question is required"
        }));
        return;
      }

      const questionnaireData:IQuestionnaire = {
        ...questionnaire,
        questionnaireName: formData.questionnaireName,
        description: formData.description,
        questionnaireItemDtos: formData.questionnaireItemDtos.map(q => ({
          question: q.question,
          questionType: q.questionType,
          questionHelpText: q.questionHelpText,
          isRequired: q.isRequired
        }))
      };

      if (type === "edit") {
        await updateQuestionnaireAsync((questionnaire as IQuestionnaire)?.id as string, questionnaireData);
        notification.success({
          message: "Questionnaire updated successfully"
        });
      } else {
        await createQuestionnaireAsync(questionnaireData);
        notification.success({
          message: "Questionnaire created successfully"
        });
      }

      closeModal();
      trigger();
    } catch (err: any) {
      notification.error({
        message: err.message || "An error occurred"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full bg-white rounded">
      {/* Fixed Header */}
      <div className="sticky top-0 bg-white z-10 px-4 py-3 border-b">
        <p className="text-xl font-bold">
          {type === "create" ? "Create Questionnaire" : "Edit Questionnaire"}
        </p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Questionnaire Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Questionnaire Details</h3>

          <div>
            <label className="block text-sm font-medium mb-2">
              Questionnaire Name <span className="text-red-500">*</span>
            </label>
            <TextField
              id="questionnaireName"
              field="Questionnaire Name"
              value={formData?.questionnaireName}
              setValue={(value) => setFormData(prev => ({ ...prev, questionnaireName: value }))}
              placeholder="e.g., Standard Supplier Onboarding"
              style=""
              type="text"
              width="w-full"
              onFocus={() => setErrors(prev => ({ ...prev, questionnaireName: "" }))}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              value={formData.description || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of this questionnaire..."
            />
          </div>
        </div>

        {/* Add New Question */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Add New Question</h3>

          <div>
            <label className="block text-sm font-medium mb-2">
              Question Text <span className="text-red-500">*</span>
            </label>
            <TextField
              id="question"
              field="Question Text"
              value={currentQuestion.question}
              setValue={(value) => setCurrentQuestion(prev => ({ ...prev, question: value }))}
              placeholder="Enter your question..."
              style=""
              type="text"
              width="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Question Type <span className="text-red-500">*</span>
            </label>
            <SelectField
              id="questionType"
              value={questionTypesList.find(x=>x.value == currentQuestion.questionType)?.label || ""}
              onChange={(value) => setCurrentQuestion(prev => ({ ...prev, questionType: Number(value)}))}
              options={questionTypesList.map(x=>({label:x.label, value:x.value.toString()}))}
              style="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Help Text (Optional)</label>
            <TextField
              id="helpText"
              field="Help Text"
              value={currentQuestion.questionHelpText || ""}
              setValue={(value) => setCurrentQuestion(prev => ({ ...prev, questionHelpText: value }))}
              placeholder="Additional guidance for this question..."
              style=""
              type="text"
              width="w-full"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isRequired"
              checked={currentQuestion.isRequired}
              onChange={(e) => setCurrentQuestion(prev => ({ ...prev, isRequired: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isRequired" className="text-sm font-medium text-gray-700">
              This question is required
            </label>
          </div>

          <button
            type="button"
            onClick={addQuestion}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Add Question</span>
          </button>
        </div>

        {/* Questions List */}
        {formData.questionnaireItemDtos.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Questions ({formData.questionnaireItemDtos.length})
            </h3>
            <div className="space-y-3">
              {formData.questionnaireItemDtos.map((question, index) => (
                <div key={question.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-gray-600">Q{index + 1}:</span>
                        <span className="text-sm font-medium text-gray-800">{question.question}</span>
                        {question.isRequired && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Required</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mb-1">Type: {question.questionType}</div>
                      {question.questionHelpText && (
                        <div className="text-xs text-gray-600 italic">{question.questionHelpText}</div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeQuestion(question.id!)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {errors.questions && <p className="text-red-500 text-xs">{errors.questions}</p>}
          </div>
        )}
      </div>

      {/* Fixed Footer */}
      <div className="sticky bottom-0 border-t bg-white p-4 mt-auto">
        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-sm text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (type === "edit" ? "Update" : "Save Questionnaire")}
          </button>
          <button
            onClick={() => closeModal()}
            type="button"
            className="px-4 py-2 bg-gray-200 text-sm text-gray-700 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
          >
            ← Cancel
          </button>
        </div>
      </div>
    </form>
  );
};

export default CreateQuestionnaireForm;
